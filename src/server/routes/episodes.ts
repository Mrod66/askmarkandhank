import {Hono} from 'hono';
import {validator} from 'hono/validator';

import {type Episode, type EpisodesPage, TOPIC_SLUGS} from '../../lib/types';
import {problem, requireMember, requirePermission, withDb, withViewer} from '../../platform/guards';
import {CODENAMES} from '../../platform/permissions';

/**
 * The show's episodes, stored in the Site Database (table `episodes`).
 *
 * Public (the `/episodes` pages and the home page render these):
 *   GET /site-api/episodes?topic=&before=&perPage=   published, newest first
 *   GET /site-api/episodes/:slug                     one published episode
 *
 * Site admins (`MANAGE_SHOW`), from the dashboard (`/portal/episodes`):
 *   GET    /site-api/episodes/manage?before=   every episode, drafts too
 *   GET    /site-api/episodes/manage/:id       one episode (for editing)
 *   POST   /site-api/episodes                  create
 *   PATCH  /site-api/episodes/:id              edit (incl. `status`)
 *   DELETE /site-api/episodes/:id              delete
 *
 * Newest first by air date, keyset-paged on (publishedAt, id): `?before=<id>`
 * is the last episode of the previous page. Never a count.
 */

/** Who may add and edit episodes and read questions: the community's site admins. */
export const MANAGE_SHOW = CODENAMES.SITE_UPDATE;

const PAGE_SIZE = 12;

const summarySelect = {
  id: true,
  slug: true,
  number: true,
  title: true,
  summary: true,
  topic: true,
  youtubeId: true,
  durationMinutes: true,
  publishedAt: true,
  status: true,
} as const;
const episodeSelect = {...summarySelect, notes: true} as const;

const idOf = (value: unknown) => {
  const n = Number(value);
  return Number.isSafeInteger(n) && n > 0 ? n : undefined;
};

const iso = <T extends {publishedAt: Date}>(row: T) => ({...row, publishedAt: row.publishedAt.toISOString()});

/**
 * A YouTube video id from a full link (watch, youtu.be, shorts, live, embed)
 * or a bare 11-character id. `null` when it is neither.
 */
export function youtubeIdOf(value: string): string | null {
  const text = value.trim();
  if (/^[\w-]{11}$/.test(text)) return text;
  const match = /(?:[?&]v=|youtu\.be\/|\/embed\/|\/shorts\/|\/live\/)([\w-]{11})(?![\w-])/.exec(text);
  return match ? match[1] : null;
}

/** `Ep. 3: Don't Panic!` → `ep-3-dont-panic` */
function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/[\s_-]+/g, '-')
      .slice(0, 100) || 'episode'
  );
}

const listQuery = validator('query', value => {
  const per = Number(value.perPage);
  return {
    topic: typeof value.topic === 'string' && TOPIC_SLUGS.includes(value.topic) ? value.topic : '',
    before: typeof value.before === 'string' ? value.before : undefined,
    perPage: Number.isInteger(per) && per >= 1 && per <= PAGE_SIZE ? String(per) : String(PAGE_SIZE),
  };
});

const manageQuery = validator('query', value => ({
  before: typeof value.before === 'string' ? value.before : undefined,
}));

type EpisodeInput = {
  title?: string;
  summary?: string;
  notes?: string;
  topic?: string;
  youtubeId?: string | null;
  number?: number | null;
  durationMinutes?: number | null;
  publishedAt?: Date;
  status?: string;
};

/**
 * Validates a create (`partial = false`) or an edit (`partial = true`). The
 * dashboard's `EPISODE_RULES` mirror these limits exactly.
 */
function episodeBody(partial: boolean) {
  return validator('json', (value, c) => {
    const v = (value ?? {}) as Record<string, unknown>;
    const out: EpisodeInput = {};
    const bad = (message: string) => c.json(problem('invalid_episode', message), 422);
    const has = (key: string) => v[key] !== undefined || !partial;
    const text = (key: 'title' | 'summary' | 'notes', max: number, min: number) => {
      if (!has(key)) return true;
      const s = typeof v[key] === 'string' ? (v[key] as string).trim() : '';
      if (s.length < min || s.length > max) return false;
      out[key] = s;
      return true;
    };
    /** A whole number in range, or empty for "none". */
    const count = (key: 'number' | 'durationMinutes', max: number) => {
      if (!has(key)) return true;
      const raw = v[key];
      if (raw === null || raw === undefined || raw === '') {
        out[key] = null;
        return true;
      }
      const n = Number(raw);
      if (!Number.isInteger(n) || n < 1 || n > max) return false;
      out[key] = n;
      return true;
    };

    if (!text('title', 140, 1)) return bad('A title needs 1 to 140 characters.');
    if (!text('summary', 600, 20)) return bad('A summary needs 20 to 600 characters.');
    if (!text('notes', 8000, 0)) return bad('Show notes can be up to 8000 characters.');
    if (has('topic')) {
      const topic = String(v.topic ?? '');
      if (!TOPIC_SLUGS.includes(topic)) return bad('Pick one of the show’s topics.');
      out.topic = topic;
    }
    if (has('youtube')) {
      const raw = typeof v.youtube === 'string' ? v.youtube.trim() : '';
      if (raw.length > 200) return bad('That YouTube link is too long.');
      const id = raw ? youtubeIdOf(raw) : null;
      if (raw && !id) return bad('Paste a YouTube link, like https://youtu.be/abc123XYZ_0.');
      out.youtubeId = id;
    }
    if (!count('number', 9999)) return bad('The episode number is a whole number from 1 to 9999.');
    if (!count('durationMinutes', 600)) return bad('The length is a whole number of minutes, like 8.');
    if (has('publishedAt')) {
      const raw = typeof v.publishedAt === 'string' ? v.publishedAt : '';
      const date = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? new Date(`${raw}T12:00:00Z`) : null;
      if (!date || Number.isNaN(date.getTime())) return bad('The air date looks like 2026-10-21.');
      out.publishedAt = date;
    }
    if (v.status !== undefined || !partial) {
      const status = String(v.status ?? 'published');
      if (status !== 'published' && status !== 'draft') return bad('Status is published or draft.');
      out.status = status;
    }
    return out;
  });
}

export const episodeRoutes = new Hono()
  // ---- public ---------------------------------------------------------------
  .get('/', listQuery, withDb, async c => {
    const {topic, before, perPage} = c.req.valid('query');
    const take = Number(perPage);
    const cursorId = idOf(before);
    const cursor = cursorId
      ? await c.var.db.episode.findUnique({where: {id: cursorId}, select: {id: true, publishedAt: true}})
      : null;
    const rows = await c.var.db.episode.findMany({
      select: summarySelect,
      where: {
        status: 'published',
        ...(topic ? {topic} : {}),
        ...(cursor
          ? {
              OR: [
                {publishedAt: {lt: cursor.publishedAt}},
                {publishedAt: cursor.publishedAt, id: {lt: cursor.id}},
              ],
            }
          : {}),
      },
      orderBy: [{publishedAt: 'desc'}, {id: 'desc'}],
      take: take + 1,
    });
    const episodes = rows.slice(0, take);
    const page: EpisodesPage = {
      episodes: episodes.map(iso),
      nextBefore: rows.length > take ? episodes.at(-1)!.id : null,
    };
    return c.json(page);
  })

  // ---- site admins (registered before `/:slug` so `manage` is not a slug) ----
  .get('/manage', manageQuery, withViewer, requireMember, requirePermission(MANAGE_SHOW), withDb, async c => {
    const cursorId = idOf(c.req.valid('query').before);
    const cursor = cursorId
      ? await c.var.db.episode.findUnique({where: {id: cursorId}, select: {id: true, publishedAt: true}})
      : null;
    const rows = await c.var.db.episode.findMany({
      select: summarySelect,
      where: cursor
        ? {
            OR: [
              {publishedAt: {lt: cursor.publishedAt}},
              {publishedAt: cursor.publishedAt, id: {lt: cursor.id}},
            ],
          }
        : undefined,
      orderBy: [{publishedAt: 'desc'}, {id: 'desc'}],
      take: 20 + 1,
    });
    const episodes = rows.slice(0, 20);
    const page: EpisodesPage = {
      episodes: episodes.map(iso),
      nextBefore: rows.length > 20 ? episodes.at(-1)!.id : null,
    };
    return c.json(page);
  })

  .get('/manage/:id', withViewer, requireMember, requirePermission(MANAGE_SHOW), withDb, async c => {
    const id = idOf(c.req.param('id'));
    const row = id ? await c.var.db.episode.findUnique({where: {id}, select: episodeSelect}) : null;
    if (!row) return c.json(problem('not_found', 'No such episode.'), 404);
    return c.json({episode: iso(row) satisfies Episode});
  })

  .get('/:slug', withDb, async c => {
    const row = await c.var.db.episode.findFirst({
      select: episodeSelect,
      where: {slug: c.req.param('slug'), status: 'published'},
    });
    if (!row) return c.json(problem('not_found', 'No such episode.'), 404);
    return c.json({episode: iso(row) satisfies Episode});
  })

  .post('/', episodeBody(false), withViewer, requireMember, requirePermission(MANAGE_SHOW), withDb, async c => {
    const input = c.req.valid('json') as EpisodeInput & {title: string; summary: string; topic: string; publishedAt: Date};
    const base = slugify(input.title);
    // A unique slug: `title`, then `title-2`, `title-3`…
    const taken = await c.var.db.episode.findMany({
      select: {slug: true},
      where: {slug: {startsWith: base}},
      take: 50,
    });
    const used = new Set(taken.map(row => row.slug));
    let slug = base;
    for (let n = 2; used.has(slug); n++) slug = `${base}-${n}`;
    const row = await c.var.db.episode.create({
      data: {...input, slug, createdBy: c.var.viewer.profileId ?? 0},
      select: episodeSelect,
    });
    return c.json({episode: iso(row) satisfies Episode}, 201);
  })

  .patch('/:id', episodeBody(true), withViewer, requireMember, requirePermission(MANAGE_SHOW), withDb, async c => {
    const id = idOf(c.req.param('id'));
    const found = id ? await c.var.db.episode.findUnique({where: {id}, select: {id: true}}) : null;
    if (!found) return c.json(problem('not_found', 'No such episode.'), 404);
    const row = await c.var.db.episode.update({
      where: {id: found.id},
      data: c.req.valid('json'),
      select: episodeSelect,
    });
    return c.json({episode: iso(row) satisfies Episode});
  })

  .delete('/:id', withViewer, requireMember, requirePermission(MANAGE_SHOW), withDb, async c => {
    const id = idOf(c.req.param('id'));
    const deleted = id ? await c.var.db.episode.deleteMany({where: {id}}) : {count: 0};
    return deleted.count ? c.json({ok: true}) : c.json(problem('not_found', 'No such episode.'), 404);
  });
