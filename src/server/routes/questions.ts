import {Hono} from 'hono';
import {validator} from 'hono/validator';

import {ASKER_ROLE_VALUES, QUESTION_STATUSES, type QuestionsPage} from '../../lib/types';
import {problem, requireMember, requirePermission, withDb, withViewer} from '../../platform/guards';
import {MANAGE_SHOW} from './episodes';

/**
 * Listener questions for Ask Mark & Hank, stored in the Site Database
 * (table `questions`).
 *
 * Anyone (the `/ask` page):
 *   POST /site-api/questions   {name, role, dealership?, body, okToFeature, website}
 *
 * Site admins (`MANAGE_SHOW`), from the dashboard (`/portal/questions`):
 *   GET    /site-api/questions?status=&before=   newest first
 *   PATCH  /site-api/questions/:id               {status}
 *   DELETE /site-api/questions/:id
 *
 * The form is open to guests (most listeners are not members yet), so it
 * keeps a hidden `website` field: a person never fills it, a spam bot does,
 * and its post is answered "thanks" without being saved. `sameOrigin`
 * (the whole app) refuses posts from other sites. No email is ever stored.
 */

/** The Ask form's limits; `src/pages/ask.astro` mirrors them exactly. */
export const QUESTION_LIMITS = {name: 80, dealership: 120, bodyMin: 10, bodyMax: 2000} as const;

const PAGE_SIZE = 20;

const select = {
  id: true,
  name: true,
  role: true,
  dealership: true,
  body: true,
  okToFeature: true,
  status: true,
  createdAt: true,
} as const;

const idOf = (value: unknown) => {
  const n = Number(value);
  return Number.isSafeInteger(n) && n > 0 ? n : undefined;
};

const askBody = validator('json', (value, c) => {
  const v = (value ?? {}) as Record<string, unknown>;
  const text = (key: string) => (typeof v[key] === 'string' ? (v[key] as string).trim() : '');
  const bad = (field: string, message: string) => c.json({...problem('invalid_question', message), field}, 422);
  const name = text('name');
  const role = text('role');
  const dealership = text('dealership');
  const body = text('body');
  if (!name) return bad('name', 'Tell us your first name.');
  if (name.length > QUESTION_LIMITS.name) return bad('name', `Use at most ${QUESTION_LIMITS.name} characters.`);
  if (!ASKER_ROLE_VALUES.includes(role)) return bad('role', 'Pick the one that fits you best.');
  if (dealership.length > QUESTION_LIMITS.dealership) {
    return bad('dealership', `Use at most ${QUESTION_LIMITS.dealership} characters.`);
  }
  if (body.length < QUESTION_LIMITS.bodyMin) {
    return bad('body', 'Give us a little more to go on: at least 10 characters.');
  }
  if (body.length > QUESTION_LIMITS.bodyMax) {
    return bad('body', `Keep it under ${QUESTION_LIMITS.bodyMax} characters. The best questions are short.`);
  }
  return {name, role, dealership, body, okToFeature: v.okToFeature === true, spam: text('website') !== ''};
});

const listQuery = validator('query', value => ({
  status:
    typeof value.status === 'string' && (QUESTION_STATUSES as readonly string[]).includes(value.status)
      ? value.status
      : '',
  before: typeof value.before === 'string' ? value.before : undefined,
}));

const statusBody = validator('json', (value, c) => {
  const status = (value as Record<string, unknown> | null)?.status;
  if (typeof status !== 'string' || !(QUESTION_STATUSES as readonly string[]).includes(status)) {
    return c.json(problem('invalid_status', 'Status is new, picked or done.'), 422);
  }
  return {status};
});

export const questionRoutes = new Hono()
  .post('/', askBody, withViewer, withDb, async c => {
    const {spam, ...input} = c.req.valid('json');
    if (spam) return c.json({ok: true}, 201);
    const viewer = c.var.viewer;
    await c.var.db.question.create({
      data: {...input, profileId: viewer.state === 'member' && !viewer.preview ? viewer.profileId : null},
      select: {id: true},
    });
    return c.json({ok: true}, 201);
  })

  .get('/', listQuery, withViewer, requireMember, requirePermission(MANAGE_SHOW), withDb, async c => {
    const {status, before} = c.req.valid('query');
    const cursor = idOf(before);
    const rows = await c.var.db.question.findMany({
      select,
      where: {...(status ? {status} : {}), ...(cursor ? {id: {lt: cursor}} : {})},
      orderBy: {id: 'desc'},
      take: PAGE_SIZE + 1,
    });
    const questions = rows.slice(0, PAGE_SIZE);
    const page: QuestionsPage = {
      questions: questions.map(row => ({...row, createdAt: row.createdAt.toISOString()})),
      nextBefore: rows.length > PAGE_SIZE ? questions.at(-1)!.id : null,
    };
    return c.json(page);
  })

  .patch('/:id', statusBody, withViewer, requireMember, requirePermission(MANAGE_SHOW), withDb, async c => {
    const id = idOf(c.req.param('id'));
    const updated = id
      ? await c.var.db.question.updateMany({where: {id}, data: {status: c.req.valid('json').status}})
      : {count: 0};
    return updated.count ? c.json({ok: true}) : c.json(problem('not_found', 'No such question.'), 404);
  })

  .delete('/:id', withViewer, requireMember, requirePermission(MANAGE_SHOW), withDb, async c => {
    const id = idOf(c.req.param('id'));
    const deleted = id ? await c.var.db.question.deleteMany({where: {id}}) : {count: 0};
    return deleted.count ? c.json({ok: true}) : c.json(problem('not_found', 'No such question.'), 404);
  });
