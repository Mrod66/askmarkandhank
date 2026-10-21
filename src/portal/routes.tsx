import {useInfiniteQuery, useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {createRootRoute, createRoute, Link, Outlet, useRouterState} from '@tanstack/react-router';
import {type ChangeEvent, type FormEvent, useState} from 'react';

import {logout, storeFile} from '../platform/browser';
import {
  type Abilities,
  ASKER_ROLES,
  type Episode,
  type EpisodesPage,
  type QuestionsPage,
  TOPICS,
  topicLabel,
  type Member,
  type UploadRow as Upload,
  type Viewer,
} from '../lib/types';
import {api, read} from './api';
import {Button, Field, rules, useForm} from './ui';

/**
 * The portal's screens: a TanStack Router app under `/portal` (basepath),
 * served by `src/pages/portal/[...path].astro` (members only), with data from
 * the Site API through TanStack Query. Links INSIDE the portal use `<Link>`;
 * links to the Astro pages or the community app (`/`, `/blog`, `/feeds`) are
 * plain `<a href>`.
 */

const when = (iso: string) =>
  new Intl.DateTimeFormat('en-GB', {dateStyle: 'medium', timeStyle: 'short'}).format(
    new Date(iso)
  );

const bytes = (n: number) =>
  n < 1024 ? `${n} B` : n < 1024 ** 2 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1024 ** 2).toFixed(1)} MB`;

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(word => word[0]?.toUpperCase() ?? '')
    .join('');

/** Grey placeholder rows while a list loads (no "Loading…" text). */
function SkeletonRows({rows = 3}: {rows?: number}) {
  return (
    <div className="list-plain" aria-busy="true" aria-label="Loading">
      {Array.from({length: rows}, (_, i) => (
        <div key={i} className="skeleton" style={{height: 56}} />
      ))}
    </div>
  );
}

function ErrorNote({error}: {error: Error}) {
  return <p className="notice">{error.message}</p>;
}

function Avatar({name, src}: {name: string; src: string | null}) {
  return src ? (
    <img className="avatar" src={src} alt="" width={40} height={40} />
  ) : (
    <span className="avatar avatar-fallback" aria-hidden="true">
      {initials(name)}
    </span>
  );
}

/** Who is signed in, and what the portal may show them. Shared by every screen. */
function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: () => read<{viewer: Viewer; abilities: Abilities}>(api.me.$get()),
    staleTime: 60_000,
  });
}

/** The brand, for the sidebar. Public and cached on the server. */
function useSite() {
  return useQuery({
    queryKey: ['site'],
    queryFn: () => read<{site: {name: string} | null}>(api.site.$get()),
    staleTime: 5 * 60_000,
  });
}

/**
 * The sidebar, in groups. `ability` hides an item the visitor may not use;
 * that only HIDES it, the route's guard is the enforcement. Add a screen:
 * its route below + one item here.
 */
const NAV_GROUPS: {
  label: string;
  items: {to: string; label: string; exact?: boolean; ability?: keyof Abilities}[];
}[] = [
  {
    label: 'Workspace',
    items: [
      {to: '/', label: 'Overview', exact: true},
      {to: '/uploads', label: 'My files'},
      {to: '/members', label: 'Members'},
    ],
  },
  {
    label: 'The show',
    items: [
      {to: '/episodes', label: 'Episodes', ability: 'manageShow'},
      {to: '/questions', label: 'Questions', ability: 'manageShow'},
    ],
  },
];

/** The screen's title for the top bar: the deepest sidebar item it is under. */
function useScreenTitle() {
  const path = useRouterState({select: s => s.location.pathname.replace(/^\/portal/, '') || '/'});
  const items = NAV_GROUPS.flatMap(group => group.items);
  const match = items
    .filter(item => (item.exact ? path === item.to : path === item.to || path.startsWith(`${item.to}/`)))
    .sort((a, b) => b.to.length - a.to.length)[0];
  return match?.label ?? 'Dashboard';
}

/**
 * The app shell: a full-height sidebar (brand, grouped nav, way back to the
 * website) and a top bar (screen title, visitor, sign out), the screen in
 * between. Every screen renders inside it; nothing here reloads the page.
 */
const rootRoute = createRootRoute({
  component: function Shell() {
    const me = useMe();
    const site = useSite();
    const title = useScreenTitle();
    const [open, setOpen] = useState(false);
    // `logout()` reloads the page when it is done, so pending never needs resetting.
    const [signingOut, setSigningOut] = useState(false);
    const viewer = me.data?.viewer;
    const abilities = me.data?.abilities;
    return (
      <div className="app-shell" data-nav-open={open ? '' : undefined}>
        <aside className="app-sidebar">
          <a className="app-brand" href="/">
            {site.data?.site?.name ?? 'Community'}
          </a>
          <nav aria-label="Dashboard" onClick={() => setOpen(false)}>
            {NAV_GROUPS.map(group => {
              const items = group.items.filter(item => !item.ability || abilities?.[item.ability]);
              if (!items.length) return null;
              return (
                <div className="app-nav-group" key={group.label}>
                  <p className="app-nav-label">{group.label}</p>
                  {items.map(item => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="app-nav-link"
                      activeOptions={{exact: item.exact ?? false}}>
                      {item.label}
                    </Link>
                  ))}
                </div>
              );
            })}
          </nav>
          <div className="app-sidebar-foot">
            <a className="app-nav-link" href="/">
              ← Back to the website
            </a>
            <a className="app-nav-link" href="/feeds">
              Community
            </a>
          </div>
        </aside>

        <div className="app-main">
          <header className="app-topbar">
            <button
              type="button"
              className="app-menu-button"
              aria-label="Menu"
              aria-expanded={open}
              onClick={() => setOpen(value => !value)}>
              ☰
            </button>
            <h1 className="app-title">{title}</h1>
            {viewer && (
              <div className="app-viewer">
                <Avatar name={viewer.name ?? ''} src={viewer.avatar} />
                <span className="app-viewer-name">{viewer.name}</span>
                {viewer.preview ? (
                  <span className="chip" title="Editor preview: a stand-in signed-in member">
                    Preview
                  </span>
                ) : (
                  <Button
                    variant="link"
                    size="sm"
                    pending={signingOut}
                    pendingLabel="Signing out…"
                    onClick={() => {
                      setSigningOut(true);
                      void logout();
                    }}>
                    Sign out
                  </Button>
                )}
              </div>
            )}
          </header>
          <main className="app-content">
            <Outlet />
          </main>
        </div>
      </div>
    );
  },
  notFoundComponent: () => (
    <div className="app-empty">
      <h2>Not found</h2>
      <p className="muted">This dashboard page does not exist.</p>
      <Link className="button" to="/">
        Back to the overview
      </Link>
    </div>
  ),
});

/** One number on the overview. `value` null = still loading. */
function Stat({label, value, hint, to}: {label: string; value: string | null; hint?: string; to?: string}) {
  const body = (
    <>
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value ?? '—'}</p>
      {hint && <p className="stat-hint">{hint}</p>}
    </>
  );
  return to ? (
    <Link className="stat stat-link" to={to}>
      {body}
    </Link>
  ) : (
    <div className="stat">{body}</div>
  );
}

/**
 * A count for a stat tile from the FIRST page of a keyset list: "12", or
 * "20+" when there are more. Never a COUNT query per request; a total that
 * must be exact comes from a counter kept in the Site Database on write.
 */
const pageCount = (rows: unknown[] | undefined, more: boolean) =>
  rows ? `${rows.length}${more ? '+' : ''}` : null;

const overviewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: function Overview() {
    const me = useMe();
    const viewer = me.data?.viewer;
    const health = useQuery({
      queryKey: ['health'],
      queryFn: () =>
        read<{preview: boolean; database: boolean; communityKey: boolean}>(api.health.$get()),
    });
    // Under the screens' query keys (['uploads'], ['episodes']): a save there
    // invalidates these too, so the numbers never go stale.
    const uploads = useQuery({
      queryKey: ['uploads', 'first'],
      queryFn: () =>
        read<{uploads: Upload[]; nextBefore: number | null}>(api.uploads.$get({query: {before: undefined}})),
    });
    const manageShow = me.data?.abilities.manageShow ?? false;
    const episodes = useQuery({
      queryKey: ['episodes', 'manage', 'first'],
      queryFn: () => read<EpisodesPage>(api.episodes.manage.$get({query: {before: undefined}})),
      enabled: manageShow,
    });
    const newQuestions = useQuery({
      queryKey: ['questions', 'new', 'first'],
      queryFn: () => read<QuestionsPage>(api.questions.$get({query: {status: 'new', before: undefined}})),
      enabled: manageShow,
    });
    const recent = uploads.data?.uploads.slice(0, 5) ?? [];

    return (
      <div className="app-page">
        <div className="app-page-head">
          <div>
            <h2>{viewer ? `Welcome back, ${viewer.name}` : 'Welcome back'}</h2>
            <p className="muted">What is happening on your site.</p>
          </div>
          <Link className="button" to="/uploads">
            Upload a file
          </Link>
        </div>

        {me.error && <ErrorNote error={me.error} />}
        {viewer?.preview && (
          <p className="notice">
            Editor preview: you are a stand-in member with every permission, and changes go to the
            Preview Database. Real sign-in and uploads work on your live site.
          </p>
        )}

        <div className="stat-grid">
          {manageShow && (
            <Stat
              label="Episodes"
              value={pageCount(episodes.data?.episodes, Boolean(episodes.data?.nextBefore))}
              to="/episodes"
            />
          )}
          {manageShow && (
            <Stat
              label="New questions"
              value={pageCount(newQuestions.data?.questions, Boolean(newQuestions.data?.nextBefore))}
              hint="From the Ask Mark & Hank page"
              to="/questions"
            />
          )}
          <Stat
            label="My files"
            value={pageCount(uploads.data?.uploads, Boolean(uploads.data?.nextBefore))}
            to="/uploads"
          />
          <Stat
            label="Site Database"
            value={health.data ? (health.data.database ? 'Connected' : 'Off') : null}
            hint={health.data && !health.data.database ? 'Ask the owner to enable it.' : undefined}
          />
          <Stat
            label="Community Key"
            value={health.data ? (health.data.communityKey ? 'Available' : 'Missing') : null}
          />
        </div>

        {manageShow && (
          <section className="app-card">
            <div className="app-card-head">
              <h3>Newest listener questions</h3>
              <Link to="/questions">View all</Link>
            </div>
            {newQuestions.error ? (
              <ErrorNote error={newQuestions.error} />
            ) : newQuestions.isPending ? (
              <SkeletonRows />
            ) : newQuestions.data.questions.length ? (
              <table className="app-table">
                <thead>
                  <tr>
                    <th>From</th>
                    <th>Question</th>
                    <th>Sent</th>
                  </tr>
                </thead>
                <tbody>
                  {newQuestions.data.questions.slice(0, 5).map(q => (
                    <tr key={q.id}>
                      <td>{q.name}</td>
                      <td className="muted">{q.body.length > 110 ? `${q.body.slice(0, 110)}…` : q.body}</td>
                      <td className="muted">{when(q.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="app-empty">
                <p className="muted">No new questions. Share the Ask page with your audience.</p>
                <a className="button ghost" href="/ask">
                  Open the Ask page
                </a>
              </div>
            )}
          </section>
        )}

        <section className="app-card">
          <div className="app-card-head">
            <h3>Recent files</h3>
            <Link to="/uploads">View all</Link>
          </div>
          {uploads.error ? (
            <ErrorNote error={uploads.error} />
          ) : uploads.isPending ? (
            <p className="muted">Loading…</p>
          ) : recent.length ? (
            <table className="app-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Size</th>
                  <th>Added</th>
                </tr>
              </thead>
              <tbody>
                {recent.map(file => (
                  <tr key={file.id}>
                    <td>
                      <a href={file.url} target="_blank" rel="noreferrer">
                        {file.originalName}
                      </a>
                    </td>
                    <td className="muted">{bytes(file.fileSize)}</td>
                    <td className="muted">{when(file.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="app-empty">
              <p className="muted">No files yet.</p>
              <Link className="button ghost" to="/uploads">
                Upload your first file
              </Link>
            </div>
          )}
        </section>
      </div>
    );
  },
});

const uploadsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/uploads',
  component: function Uploads() {
    const queryClient = useQueryClient();
    const uploads = useInfiniteQuery({
      queryKey: ['uploads'],
      initialPageParam: undefined as string | undefined,
      queryFn: ({pageParam}) =>
        read<{uploads: Upload[]; nextBefore: number | null}>(
          api.uploads.$get({query: {before: pageParam}})
        ),
      getNextPageParam: last => (last.nextBefore ? String(last.nextBefore) : undefined),
    });
    // 1. browser → storage (presign, PUT)  2. the Site API registers it as this member and saves it.
    const add = useMutation({
      mutationFn: async (file: File) => {
        const stored = await storeFile(file);
        return read<{upload: Upload}>(api.uploads.$post({json: stored}));
      },
      onSuccess: () => queryClient.invalidateQueries({queryKey: ['uploads']}),
    });
    const pick = (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = '';
      if (file) add.mutate(file);
    };
    const rows = uploads.data?.pages.flatMap(page => page.uploads) ?? [];
    const preview = useMe().data?.viewer.preview ?? false;

    return (
      <div className="app-page">
        <h2>My files</h2>
        <p className="muted">
          Files go straight from your browser to the community's storage; this site keeps the link.
          Images up to 10 MB, documents up to 500 MB.
        </p>
        {preview ? (
          <p className="notice">
            Uploads go from a signed-in member's browser to the community's storage, so they only
            work on your live site, not in the editor preview.
          </p>
        ) : (
          // A file picker needs a <label>; it follows the same busy rules as <Button>.
          <label
            className="button upload-button"
            aria-busy={add.isPending || undefined}
            aria-disabled={add.isPending || undefined}>
            {add.isPending && <span className="spinner" aria-hidden="true" />}
            {add.isPending ? 'Uploading…' : 'Upload a file'}
            <input type="file" onChange={pick} disabled={add.isPending} hidden />
          </label>
        )}
        {add.error && <ErrorNote error={add.error} />}
        {uploads.error && <ErrorNote error={uploads.error} />}
        {rows.length === 0 && uploads.isSuccess && <p className="muted">No files yet.</p>}
        <ul className="files">
          {rows.map(file => (
            <li key={file.id}>
              {file.fileType === 'image' ? (
                <img src={file.url} alt="" width={56} height={56} loading="lazy" />
              ) : (
                <span className="file-icon" aria-hidden="true">
                  {file.originalName.split('.').pop()?.toUpperCase()}
                </span>
              )}
              <div>
                <a href={file.url} target="_blank" rel="noreferrer">
                  {file.originalName}
                </a>
                <span className="meta">
                  {bytes(file.fileSize)} · {when(file.createdAt)}
                </span>
              </div>
            </li>
          ))}
        </ul>
        {uploads.hasNextPage && (
          <Button
            variant="ghost"
            onClick={() => uploads.fetchNextPage()}
            pending={uploads.isFetchingNextPage}
            pendingLabel="Loading…">
            Load more
          </Button>
        )}
      </div>
    );
  },
});

const membersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/members',
  component: function Members() {
    const [search, setSearch] = useState('');
    const [term, setTerm] = useState('');
    const members = useInfiniteQuery({
      queryKey: ['members', term],
      initialPageParam: undefined as string | undefined,
      queryFn: ({pageParam}) =>
        read<{members: Member[]; nextCursor: string | null}>(
          api.members.$get({query: {cursor: pageParam, search: term}})
        ),
      getNextPageParam: last => last.nextCursor ?? undefined,
    });
    const submit = (event: FormEvent) => {
      event.preventDefault();
      setTerm(search.trim());
    };
    const rows = members.data?.pages.flatMap(page => page.members) ?? [];

    return (
      <div className="app-page">
        <h2>Members</h2>
        <p className="muted">Read by this site's server with the Community Key.</p>
        <form className="search" onSubmit={submit}>
          <input
            type="search"
            aria-label="Search members by name"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name"
            maxLength={50}
          />
          <Button
            variant="ghost"
            type="submit"
            pending={members.isFetching && !members.isFetchingNextPage}
            pendingLabel="Searching…">
            Search
          </Button>
        </form>
        {members.error && <ErrorNote error={members.error} />}
        {rows.length === 0 && members.isSuccess && <p className="muted">No members found.</p>}
        <ul className="members">
          {rows.map(member => (
            <li key={member.id}>
              <Avatar name={member.name} src={member.avatar} />
              <div>
                <a href={`/profile/${encodeURIComponent(member.slug)}`}>{member.name}</a>
                {member.role && <span className="meta">{member.role}</span>}
              </div>
            </li>
          ))}
        </ul>
        {members.hasNextPage && (
          <Button
            variant="ghost"
            onClick={() => members.fetchNextPage()}
            pending={members.isFetchingNextPage}
            pendingLabel="Loading…">
            Load more
          </Button>
        )}
      </div>
    );
  },
});

// ------------------------------------------------------------- the show --

const today = () => new Date().toISOString().slice(0, 10);

const EMPTY_EPISODE = {
  title: '',
  number: '',
  publishedAt: today(),
  topic: TOPICS[0].slug as string,
  youtube: '',
  durationMinutes: '',
  summary: '',
  notes: '',
  status: 'published',
};

/** The episode form's rules: the SAME limits `src/server/routes/episodes.ts` enforces. */
const EPISODE_RULES = {
  title: [rules.required('Give the episode a title.'), rules.maxLength(140)],
  number: [rules.pattern(/^[1-9]\d{0,3}$/, 'Use a whole number from 1 to 9999, or leave it empty.')],
  publishedAt: [
    rules.required('Pick the date the episode aired.'),
    rules.pattern(/^\d{4}-\d{2}-\d{2}$/, 'Use a date like 2026-10-21.'),
  ],
  youtube: [
    rules.maxLength(200),
    rules.pattern(
      /^([\w-]{11}|https:\/\/(www\.|m\.)?(youtube\.com|youtu\.be)\/\S+)$/,
      'Paste a YouTube link, like https://youtu.be/abc123XYZ_0, or leave it empty.'
    ),
  ],
  durationMinutes: [rules.pattern(/^[1-9]\d{0,2}$/, 'Use a whole number of minutes, like 8.')],
  summary: [
    rules.required('Write a short summary for the episode list.'),
    rules.minLength(20, 'Write at least 20 characters so viewers know what it covers.'),
    rules.maxLength(600),
  ],
  notes: [rules.maxLength(8000)],
};

/** Site admins: add, edit, hide and delete episodes (`/site-api/episodes`, `MANAGE_SHOW`). */
const episodesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/episodes',
  component: function Episodes() {
    const queryClient = useQueryClient();
    const [editing, setEditing] = useState<number | 'new' | null>(null);
    const form = useForm(EMPTY_EPISODE, EPISODE_RULES);
    const episodes = useInfiniteQuery({
      queryKey: ['episodes', 'manage'],
      initialPageParam: undefined as string | undefined,
      queryFn: ({pageParam}) => read<EpisodesPage>(api.episodes.manage.$get({query: {before: pageParam}})),
      getNextPageParam: last => (last.nextBefore ? String(last.nextBefore) : undefined),
    });
    const refresh = () => queryClient.invalidateQueries({queryKey: ['episodes']});
    const close = () => {
      setEditing(null);
      form.reset({...EMPTY_EPISODE, publishedAt: today()});
    };
    const save = useMutation({
      mutationFn: (values: typeof EMPTY_EPISODE) => {
        const json = {
          ...values,
          number: values.number.trim() ? Number(values.number) : null,
          durationMinutes: values.durationMinutes.trim() ? Number(values.durationMinutes) : null,
        };
        return editing === 'new'
          ? read<{episode: Episode}>(api.episodes.$post({json}))
          : read<{episode: Episode}>(api.episodes[':id'].$patch({param: {id: String(editing)}, json}));
      },
      onSuccess: () => {
        close();
        return refresh();
      },
    });
    const open = useMutation({
      mutationFn: (id: number) =>
        read<{episode: Episode}>(api.episodes.manage[':id'].$get({param: {id: String(id)}})),
      onSuccess: ({episode}, id) => {
        form.reset({
          title: episode.title,
          number: episode.number ? String(episode.number) : '',
          publishedAt: episode.publishedAt.slice(0, 10),
          topic: episode.topic,
          youtube: episode.youtubeId ? `https://youtu.be/${episode.youtubeId}` : '',
          durationMinutes: episode.durationMinutes ? String(episode.durationMinutes) : '',
          summary: episode.summary,
          notes: episode.notes,
          status: episode.status,
        });
        save.reset();
        setEditing(id);
      },
    });
    const setStatus = useMutation({
      mutationFn: ({id, status}: {id: number; status: string}) =>
        read(api.episodes[':id'].$patch({param: {id: String(id)}, json: {status}})),
      onSuccess: refresh,
    });
    const remove = useMutation({
      mutationFn: (id: number) => read(api.episodes[':id'].$delete({param: {id: String(id)}})),
      onSuccess: refresh,
    });
    const busyId =
      (open.isPending && open.variables) ||
      (setStatus.isPending && setStatus.variables?.id) ||
      (remove.isPending && remove.variables) ||
      null;
    const rows = episodes.data?.pages.flatMap(page => page.episodes) ?? [];

    return (
      <div className="app-page">
        <div className="app-page-head">
          <div>
            <h2>Episodes</h2>
            <p className="muted">
              Listed newest first on <a href="/episodes">/episodes</a>; the newest one plays on the home page.
            </p>
          </div>
          {editing === null && (
            <Button
              onClick={() => {
                form.reset({...EMPTY_EPISODE, publishedAt: today()});
                save.reset();
                setEditing('new');
              }}>
              Add an episode
            </Button>
          )}
        </div>

        {editing !== null && (
          <form className="app-card form-card" onSubmit={form.submit(values => save.mutate(values))} noValidate>
            <h3>{editing === 'new' ? 'New episode' : 'Edit episode'}</h3>
            <div className="form-grid">
              <div className="full">
                <Field id="f-title" label="Title" error={form.error('title')}>
                  <input {...form.field('title')} autoComplete="off" />
                </Field>
              </div>
              <div className="full">
                <Field
                  id="f-youtube"
                  label="YouTube link"
                  optional
                  hint="Paste the video’s link. Leave empty to show “Video coming soon”."
                  error={form.error('youtube')}>
                  <input {...form.field('youtube')} inputMode="url" placeholder="https://youtu.be/abc123XYZ_0" />
                </Field>
              </div>
              <Field id="f-topic" label="Topic">
                <select {...form.field('topic')}>
                  {TOPICS.map(topic => (
                    <option key={topic.slug} value={topic.slug}>
                      {topic.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field id="f-publishedAt" label="Air date" error={form.error('publishedAt')}>
                <input {...form.field('publishedAt')} type="date" />
              </Field>
              <Field id="f-number" label="Episode number" optional error={form.error('number')}>
                <input {...form.field('number')} inputMode="numeric" placeholder="8" />
              </Field>
              <Field id="f-durationMinutes" label="Length in minutes" optional error={form.error('durationMinutes')}>
                <input {...form.field('durationMinutes')} inputMode="numeric" placeholder="7" />
              </Field>
              <div className="full">
                <Field
                  id="f-summary"
                  label="Summary"
                  hint="Two or three sentences for the episode list. 20 to 600 characters."
                  error={form.error('summary')}>
                  <textarea {...form.field('summary')} rows={3} />
                </Field>
              </div>
              <div className="full">
                <Field
                  id="f-notes"
                  label="Show notes"
                  optional
                  hint="Shown on the episode’s page. Leave a blank line between paragraphs."
                  error={form.error('notes')}>
                  <textarea {...form.field('notes')} rows={8} />
                </Field>
              </div>
              <Field id="f-status" label="Visibility">
                <select {...form.field('status')}>
                  <option value="published">Published: listed on the site</option>
                  <option value="draft">Draft: only here</option>
                </select>
              </Field>
            </div>
            {save.error && <ErrorNote error={save.error} />}
            <div className="actions">
              <Button type="submit" pending={save.isPending} pendingLabel="Saving…">
                {editing === 'new' ? 'Add episode' : 'Save changes'}
              </Button>
              <Button variant="ghost" onClick={close} disabled={save.isPending}>
                Cancel
              </Button>
            </div>
          </form>
        )}

        {episodes.error && <ErrorNote error={episodes.error} />}
        {episodes.isPending && <SkeletonRows />}
        {rows.length === 0 && episodes.isSuccess && (
          <div className="app-empty">
            <p className="muted">No episodes yet. Add your first one to fill the home page and the episodes list.</p>
          </div>
        )}
        <ul className="files">
          {rows.map(episode => {
            const busy = busyId === episode.id;
            return (
              <li key={episode.id} aria-busy={busy || undefined}>
                <div>
                  <a href={`/episodes/${encodeURIComponent(episode.slug)}`}>
                    {episode.number ? `Ep. ${episode.number}: ` : ''}
                    {episode.title}
                  </a>
                  <span className="meta">
                    {topicLabel(episode.topic)} · {episode.publishedAt.slice(0, 10)} ·{' '}
                    {episode.youtubeId ? 'video linked' : 'no video yet'}
                    {episode.status === 'draft' ? ' · draft' : ''}
                  </span>
                </div>
                <div className="row-actions">
                  <Button
                    variant="link"
                    size="sm"
                    pending={open.isPending && open.variables === episode.id}
                    pendingLabel="Opening…"
                    disabled={busy || save.isPending}
                    onClick={() => open.mutate(episode.id)}>
                    Edit
                  </Button>
                  <Button
                    variant="link"
                    size="sm"
                    pending={setStatus.isPending && setStatus.variables?.id === episode.id}
                    pendingLabel={episode.status === 'published' ? 'Hiding…' : 'Publishing…'}
                    disabled={busy}
                    onClick={() =>
                      setStatus.mutate({id: episode.id, status: episode.status === 'published' ? 'draft' : 'published'})
                    }>
                    {episode.status === 'published' ? 'Hide' : 'Publish'}
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    pending={remove.isPending && remove.variables === episode.id}
                    pendingLabel="Deleting…"
                    disabled={busy}
                    onClick={() => window.confirm(`Delete “${episode.title}”?`) && remove.mutate(episode.id)}>
                    Delete
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
        {(open.error || setStatus.error || remove.error) && (
          <ErrorNote error={(open.error ?? setStatus.error ?? remove.error)!} />
        )}
        {episodes.hasNextPage && (
          <Button
            variant="ghost"
            onClick={() => episodes.fetchNextPage()}
            pending={episodes.isFetchingNextPage}
            pendingLabel="Loading…">
            Load more
          </Button>
        )}
      </div>
    );
  },
});

const roleLabel = (value: string) => ASKER_ROLES.find(role => role.value === value)?.label ?? value;
const STATUS_TABS = [
  {value: 'new', label: 'New'},
  {value: 'picked', label: 'Picked for the show'},
  {value: 'done', label: 'Done'},
  {value: '', label: 'All'},
];

/** Site admins: read listener questions from /ask and sort them. */
const questionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/questions',
  component: function Questions() {
    const queryClient = useQueryClient();
    const [status, setStatusFilter] = useState('new');
    const questions = useInfiniteQuery({
      queryKey: ['questions', status],
      initialPageParam: undefined as string | undefined,
      queryFn: ({pageParam}) =>
        read<QuestionsPage>(api.questions.$get({query: {status, before: pageParam}})),
      getNextPageParam: last => (last.nextBefore ? String(last.nextBefore) : undefined),
    });
    const refresh = () => queryClient.invalidateQueries({queryKey: ['questions']});
    const move = useMutation({
      mutationFn: ({id, status}: {id: number; status: string}) =>
        read(api.questions[':id'].$patch({param: {id: String(id)}, json: {status}})),
      onSuccess: refresh,
    });
    const remove = useMutation({
      mutationFn: (id: number) => read(api.questions[':id'].$delete({param: {id: String(id)}})),
      onSuccess: refresh,
    });
    const busyId = (move.isPending && move.variables?.id) || (remove.isPending && remove.variables) || null;
    const rows = questions.data?.pages.flatMap(page => page.questions) ?? [];

    return (
      <div className="app-page">
        <div className="app-page-head">
          <div>
            <h2>Listener questions</h2>
            <p className="muted">
              Sent from <a href="/ask">the Ask Mark &amp; Hank page</a>. Email questions arrive at
              askmarkandhank@gmail.com instead.
            </p>
          </div>
        </div>

        <div className="chip-tabs" role="group" aria-label="Show questions by status" style={{margin: 0}}>
          {STATUS_TABS.map(tab => (
            <button
              key={tab.value}
              type="button"
              className="chip-tab"
              aria-current={status === tab.value ? 'page' : undefined}
              onClick={() => setStatusFilter(tab.value)}>
              {tab.label}
            </button>
          ))}
        </div>

        {questions.error && <ErrorNote error={questions.error} />}
        {questions.isPending && <SkeletonRows />}
        {rows.length === 0 && questions.isSuccess && (
          <div className="app-empty">
            <p className="muted">
              {status === 'new' ? 'No new questions. Share the Ask page with your audience.' : 'Nothing here yet.'}
            </p>
            <a className="button ghost" href="/ask">
              Open the Ask page
            </a>
          </div>
        )}
        <ul className="list-plain">
          {rows.map(q => {
            const busy = busyId === q.id;
            return (
              <li key={q.id} className="question-row" aria-busy={busy || undefined}>
                <div>
                  <strong>{q.name}</strong>
                  <span className="meta">
                    {' '}
                    · {roleLabel(q.role)}
                    {q.dealership ? ` · ${q.dealership}` : ''} · {when(q.createdAt)}
                  </span>
                  <p className="question-body">{q.body}</p>
                  <p className="meta" style={{marginTop: 8}}>
                    {q.okToFeature ? (
                      <span className="badge success">OK to read on the show</span>
                    ) : (
                      <span className="badge grey">Do not read their name on air</span>
                    )}{' '}
                    {q.status !== 'new' && <span className="badge">{q.status === 'picked' ? 'Picked' : 'Done'}</span>}
                  </p>
                </div>
                <div className="row-actions">
                  {q.status !== 'picked' && (
                    <Button
                      variant="link"
                      size="sm"
                      pending={move.isPending && move.variables?.id === q.id && move.variables.status === 'picked'}
                      pendingLabel="Saving…"
                      disabled={busy}
                      onClick={() => move.mutate({id: q.id, status: 'picked'})}>
                      Pick for the show
                    </Button>
                  )}
                  {q.status !== 'done' && (
                    <Button
                      variant="link"
                      size="sm"
                      pending={move.isPending && move.variables?.id === q.id && move.variables.status === 'done'}
                      pendingLabel="Saving…"
                      disabled={busy}
                      onClick={() => move.mutate({id: q.id, status: 'done'})}>
                      Mark done
                    </Button>
                  )}
                  <Button
                    variant="danger"
                    size="sm"
                    pending={remove.isPending && remove.variables === q.id}
                    pendingLabel="Deleting…"
                    disabled={busy}
                    onClick={() => window.confirm(`Delete the question from ${q.name}?`) && remove.mutate(q.id)}>
                    Delete
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
        {(move.error || remove.error) && <ErrorNote error={(move.error ?? remove.error)!} />}
        {questions.hasNextPage && (
          <Button
            variant="ghost"
            onClick={() => questions.fetchNextPage()}
            pending={questions.isFetchingNextPage}
            pendingLabel="Loading…">
            Load more
          </Button>
        )}
      </div>
    );
  },
});

export const routeTree = rootRoute.addChildren([
  overviewRoute,
  uploadsRoute,
  membersRoute,
  episodesRoute,
  questionsRoute,
]);
