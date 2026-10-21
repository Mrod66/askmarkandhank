/**
 * The shapes the Site API answers with. Browser-safe (no server code): pages,
 * the portal and `src/server/` all import them from here.
 *
 * Every one is OUR shape, built field by field from the platform's answers, so
 * nothing the platform adds later (a member's email, say) reaches a page.
 */

export type {Site, Viewer, ViewerState} from '../platform/types';

export interface PostAuthor {
  id: number;
  /** Already joined. Never an email. */
  name: string;
  avatar: string | null;
}

export interface PostTerm {
  id: number;
  name: string;
  slug: string;
}

export interface PostSummary {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  coverUrl: string | null;
  publishedAt: string | null;
  authors: PostAuthor[];
  categories: PostTerm[];
  tags: PostTerm[];
}

export interface Post extends PostSummary {
  /** Rich-text HTML from the community's blog editor, already sanitized. */
  content: string;
}

export interface PostsPage {
  posts: PostSummary[];
  page: number;
  hasMore: boolean;
}

/** What the visitor may do on THIS site (derived from their Role Manager codenames). */
export interface Abilities {
  /** Add and edit episodes, read listener questions (`community:site:update`). */
  manageShow: boolean;
}

export interface Member {
  id: number;
  slug: string;
  name: string;
  avatar: string | null;
  role: string | null;
}

export interface UploadRow {
  id: number;
  url: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
}

// ------------------------------------------------------------- the show --

/** The topics the show covers. `slug` is stored on each episode. */
export const TOPICS = [
  {slug: 'unsold-follow-up', label: 'Unsold showroom follow-up'},
  {slug: 'internet-leads', label: 'Internet leads'},
  {slug: 'road-to-the-sale', label: 'The road to the sale'},
  {slug: 'crm-follow-up', label: 'CRM follow-up'},
  {slug: 'inbound-calls', label: 'Inbound calls'},
  {slug: 'outbound-calls', label: 'Outbound calls'},
  {slug: 'career', label: 'Building a career'},
] as const;
export type TopicSlug = (typeof TOPICS)[number]['slug'];
export const TOPIC_SLUGS: string[] = TOPICS.map(topic => topic.slug);
export const topicLabel = (slug: string) => TOPICS.find(topic => topic.slug === slug)?.label ?? slug;

export interface EpisodeSummary {
  id: number;
  slug: string;
  number: number | null;
  title: string;
  summary: string;
  topic: string;
  youtubeId: string | null;
  durationMinutes: number | null;
  publishedAt: string;
  status: string;
}

export interface Episode extends EpisodeSummary {
  /** Plain text; paragraphs separated by blank lines. */
  notes: string;
}

export interface EpisodesPage {
  episodes: EpisodeSummary[];
  /** Pass back as `?before=` for the next page; null on the last one. */
  nextBefore: number | null;
}

/** Who is asking, on the Ask Mark & Hank form. */
export const ASKER_ROLES = [
  {value: 'new-rep', label: 'New to car sales'},
  {value: 'veteran', label: 'Veteran salesperson'},
  {value: 'bdc', label: 'BDC rep'},
  {value: 'manager', label: 'Sales manager'},
  {value: 'other', label: 'Something else'},
] as const;
export const ASKER_ROLE_VALUES: string[] = ASKER_ROLES.map(role => role.value);

export const QUESTION_STATUSES = ['new', 'picked', 'done'] as const;

export interface QuestionRow {
  id: number;
  name: string;
  role: string;
  dealership: string;
  body: string;
  okToFeature: boolean;
  status: string;
  createdAt: string;
}

export interface QuestionsPage {
  questions: QuestionRow[];
  nextBefore: number | null;
}
