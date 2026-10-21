/**
 * The site's own words: navigation, photos and every page's copy.
 *
 * Edit freely. The community's NAME and LOGO are not here: they come from the
 * platform (`GET /site-api/site`). Episodes are not here either: they live in
 * the Site Database and are edited at /portal/episodes.
 */

import type {TopicSlug} from '../lib/types';

export interface NavItem {
  label: string;
  href: string;
}

/**
 * Top navigation and footer. Every href is a page of THIS site or an App page
 * (`/join`, `/login`, `/feeds`…): all plain links.
 */
export const NAV: NavItem[] = [
  {label: 'Home', href: '/'},
  {label: 'Episodes', href: '/episodes'},
  {label: 'Topics', href: '/topics'},
  {label: 'About', href: '/about'},
  {label: 'Ask Mark & Hank', href: '/ask'},
  {label: 'Blog', href: '/blog'},
];

export const SHOW = {
  name: 'Real Car Talk with Mark and Hank',
  shortName: 'Real Car Talk',
  community: 'Real Car Sales Talk',
  email: 'askmarkandhank@gmail.com',
  tagline: 'Short episodes for car salespeople who want to earn trust back and sell more.',
  /** Shown at the bottom of every page. */
  closing: {
    lead: 'In automotive, your raise becomes effective the moment you do.',
    punch: 'Now go make a friend and sell a car.',
  },
};

/**
 * Stand-in photos from Unsplash. Replace with your own. Mark and Hank have no
 * photo yet: the About page shows their initials until `photo` is set below.
 */
const unsplash = (id: string, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=75`;

export const PHOTOS = {
  handshake: unsplash('1521791136064-7986c2920216'),
  showroom: unsplash('1492144534655-ae79c964c9d7'),
  training: unsplash('1556761175-5973dc0f32e7'),
  phone: unsplash('1423666639041-f56000c27a9a'),
};

/** The picture shown for an episode that has no YouTube video yet. */
export const EPISODE_FALLBACK_PHOTO = unsplash('1492144534655-ae79c964c9d7', 960);

export const HOME = {
  hero: {
    eyebrow: 'Real Car Talk with Mark and Hank',
    title: 'How does a car salesperson thrive right now?',
    body: 'Customers changed after COVID. They research for weeks, walk in knowing the numbers, and some pay a buyer advocate just to skip you. Short episodes, straight answers, one customer at a time.',
    cta: 'Join the Community',
  },
  intro: {
    eyebrow: 'The show',
    title: 'Five to ten minutes. One real problem. What to do about it today.',
    paragraphs: [
      'Real Car Talk is a short YouTube show for people who sell cars for a living. Mark Rodriguez has spent 30 years in automotive and coaches dealership phone, showroom and service teams. Hank Eisenhower is a former General Manager who still works the sales desk every day.',
      'Every episode takes one situation you will face this week, like an unsold guest, a cold internet lead or a caller who only wants a price, and talks through what earns trust now.',
    ],
    pillars: [
      {
        title: 'No bashing',
        body: 'We do not trash customers, advocates, other stores or the people who sell for them.',
      },
      {
        title: 'No defending the bad stuff',
        body: 'Some of the distrust was earned. We say so, and then we talk about how to do better.',
      },
      {
        title: 'Built for the floor',
        body: 'Something you can use on your next up, your next call or your next follow-up.',
      },
    ],
  },
  audience: {
    eyebrow: 'Who it is for',
    title: 'Day one or year twenty, the customer changed on all of us.',
    items: [
      {
        title: 'Brand-new reps',
        body: 'In your first 30 days and trying to figure out what actually works before the bad habits set in.',
      },
      {
        title: 'Veterans',
        body: 'Fifteen or twenty years in, and the moves that used to work are not landing the way they did.',
      },
      {
        title: 'BDC reps',
        body: 'On the phones and in the inbox all day, turning leads and calls into appointments that show.',
      },
      {
        title: 'Sales managers',
        body: 'Coaching a team through a market where the customer often knows as much as the desk.',
      },
    ],
  },
  topics: {
    eyebrow: 'What we cover',
    title: 'The parts of the job that changed the most.',
  },
  community: {
    eyebrow: 'Real Car Sales Talk',
    title: 'The show is the start. The community is where you get better.',
    body: 'Join other salespeople, BDC reps and managers who are working through the same customers you are. Share what worked, ask about what did not, and bring your questions to Mark and Hank.',
    points: [
      'Talk through real deals with people who do this every day',
      'Get new episodes and the conversation that follows',
      'Send your questions straight to Mark and Hank',
    ],
  },
};

export const ABOUT = {
  eyebrow: 'About the show',
  title: 'Two car people who still believe in the job.',
  lede: 'Real Car Talk with Mark and Hank is a short-episode YouTube show for car salespeople, and Real Car Sales Talk is the community around it.',
  hosts: [
    {
      key: 'mark',
      name: 'Mark Rodriguez',
      initials: 'MR',
      /** A link to Mark's real photo; null shows his initials. */
      photo: null as string | null,
      role: 'President, Auto Client Care',
      paragraphs: [
        'Mark has spent 30 years in automotive. As President of Auto Client Care, he coaches dealership phone, showroom and service teams on how to turn conversations into appointments and appointments into customers who come back.',
        'He has listened to more dealership phone calls than most people will ever make, and he brings what he hears on those calls to every episode.',
      ],
      facts: [
        '30 years in automotive',
        'President of Auto Client Care',
        'Coaches phone, showroom and service teams',
      ],
    },
    {
      key: 'hank',
      name: 'Hank Eisenhower',
      initials: 'HE',
      /** A link to Hank's real photo; null shows his initials. */
      photo: null as string | null,
      role: 'Former General Manager, on the desk every day',
      paragraphs: [
        'Hank is a former General Manager who chose to stay close to the deal. He is on the sales desk every day, working numbers, saving deals and coaching salespeople in real time.',
        'When an episode talks about what is happening in showrooms right now, Hank is the one who saw it this morning.',
      ],
      facts: ['Former General Manager', 'On the sales desk every day', 'Works deals with salespeople in real time'],
    },
  ],
  why: {
    eyebrow: 'Why we started',
    title: 'Customers changed. Most training did not.',
    paragraphs: [
      'After COVID, shoppers started doing most of the work before they ever met a salesperson. They compare prices across states, read every review, and show up with a trade value already in hand. Some pay buyer-advocate services just to avoid the showroom altogether.',
      'We think that is a challenge, not the end of the profession. The salespeople who thrive now are the ones who earn trust back, one customer at a time. That is what this show is about.',
    ],
    quote: 'We don’t bash anyone, and we don’t defend the bad stuff.',
  },
};

export interface TopicCopy {
  slug: TopicSlug;
  title: string;
  /** One line under the title on the home page and the topics page. */
  short: string;
  body: string[];
  points: string[];
}

/** The topics page, top to bottom. `slug` matches the episode's topic. */
export const TOPIC_COPY: TopicCopy[] = [
  {
    slug: 'unsold-follow-up',
    title: 'Unsold showroom follow-up',
    short: 'What to do after a guest leaves without buying.',
    body: [
      'An unsold guest is not a lost customer. They are still shopping, and you are now one of the stores they are comparing. The follow-up decides who they come back to.',
    ],
    points: [
      'The first 24 hours after an unsold visit',
      'Follow-up that answers the question they left with',
      'When to call, when to text, and when to stop',
    ],
  },
  {
    slug: 'internet-leads',
    title: 'Internet leads',
    short: 'Replies that sound like a person who read the question.',
    body: [
      'Internet shoppers have already done their homework. A canned reply tells them you have not. We talk about responses that respect the research and still move toward a visit.',
    ],
    points: [
      'Answering the question they actually asked',
      'The first reply, the second and the fifth',
      'Turning a price request into a conversation',
    ],
  },
  {
    slug: 'road-to-the-sale',
    title: 'The road to the sale',
    short: 'Which steps still matter when customers arrive informed.',
    body: [
      'The steps to the sale did not disappear. They changed shape. We cover which ones to shorten, which to skip and which matter more now than ever.',
    ],
    points: [
      'Meeting a customer who already did the research',
      'Needs conversations that are not interrogations',
      'Demos and walkarounds for people who watched the reviews',
    ],
  },
  {
    slug: 'crm-follow-up',
    title: 'CRM follow-up',
    short: 'Using the CRM to remember people, not just clear tasks.',
    body: [
      'Clearing tasks is not the same thing as following up. Good notes make every touch feel like the next part of a conversation instead of a reminder from a robot.',
    ],
    points: [
      'Notes that make the next call personal',
      'Follow-up schedules that fit how people shop now',
      'What managers look for in a deal that went cold',
    ],
  },
  {
    slug: 'inbound-calls',
    title: 'Inbound calls',
    short: 'The warmest lead you will get all day.',
    body: [
      'Someone picked up the phone and called your store. Most of those calls end with a price and no appointment. We talk about answering honestly and still giving the caller a reason to come in.',
    ],
    points: [
      'Getting the caller’s name early, without being pushy',
      'Handling “What’s your best price?”',
      'Setting an appointment that actually shows',
    ],
  },
  {
    slug: 'outbound-calls',
    title: 'Outbound calls',
    short: 'Calls and voicemails worth answering.',
    body: [
      '“Just following up” gives the customer nothing. We cover how to open an outbound call with a real reason, and how to leave a voicemail that gets a call back.',
    ],
    points: [
      'A first sentence that earns the second',
      'Voicemails with one clear reason to call back',
      'Following up on service and sold customers',
    ],
  },
  {
    slug: 'career',
    title: 'Building a career when customers are told not to trust us',
    short: 'Staying in the business, and getting better at it, when the reputation is working against you.',
    body: [
      'Some customers are being told to avoid salespeople entirely, and some are paying for it. We talk honestly about why, what we cannot defend, and how to build a career anyway.',
    ],
    points: [
      'What buyer-advocate customers are really paying for',
      'Earning referrals and repeat business',
      'Staying motivated when the market is tough',
    ],
  },
];

export const ASK = {
  eyebrow: 'Ask Mark & Hank',
  title: 'Got a customer you can’t crack? Ask us.',
  lede: 'Send us the situation you are stuck on: a lead that went quiet, an objection you keep hearing, a manager question, a career question. The best questions become episodes.',
  emailTitle: 'Rather email?',
  emailBody: 'Send your question to the show’s inbox. Include as much of the situation as you can, and leave out customer names.',
  tips: [
    {title: 'Be specific', body: 'Tell us what the customer said and what you said back. That is where the good answers come from.'},
    {title: 'Keep it anonymous', body: 'Leave out customer names, phone numbers and your store’s private numbers.'},
    {title: 'Any level', body: 'First-week questions are as welcome as twenty-year ones. Somebody else is wondering the same thing.'},
  ],
};

/** Fill `{name}` with the community's name. */
export function withName(text: string, name: string): string {
  return text.replaceAll('{name}', name);
}
