BEGIN;

-- CreateTable
CREATE TABLE "episodes" (
    "id" SERIAL NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "number" INTEGER,
    "title" VARCHAR(140) NOT NULL,
    "summary" VARCHAR(600) NOT NULL,
    "notes" VARCHAR(8000) NOT NULL DEFAULT '',
    "topic" VARCHAR(40) NOT NULL,
    "youtube_id" VARCHAR(20),
    "duration_minutes" INTEGER,
    "published_at" TIMESTAMP(3) NOT NULL,
    "status" VARCHAR(10) NOT NULL DEFAULT 'published',
    "created_by" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "episodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "role" VARCHAR(20) NOT NULL,
    "dealership" VARCHAR(120) NOT NULL DEFAULT '',
    "body" VARCHAR(2000) NOT NULL,
    "ok_to_feature" BOOLEAN NOT NULL DEFAULT false,
    "status" VARCHAR(10) NOT NULL DEFAULT 'new',
    "profile_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "episodes_slug_key" ON "episodes"("slug");

-- CreateIndex
CREATE INDEX "episodes_status_published_at_id_idx" ON "episodes"("status", "published_at", "id");

-- CreateIndex
CREATE INDEX "questions_status_id_idx" ON "questions"("status", "id");

-- Starter episodes, one per topic, so the site is not empty on day one.
-- No video yet (youtube_id NULL): the owner edits or deletes them in
-- /portal/episodes and adds the real YouTube links.
INSERT INTO "episodes" ("slug", "number", "title", "summary", "notes", "topic", "duration_minutes", "published_at", "created_by", "updated_at")
VALUES
  ('they-left-without-buying-now-what', 1,
   $t$They Left Without Buying. Now What?$t$,
   $t$Most unsold showroom guests buy within a week, just not from the person who let them walk. Mark and Hank break down the first 24 hours after an unsold visit and the one follow-up message that actually gets a reply.$t$,
   $t$The customer walked. That does not mean they are done shopping. It means they are still shopping, and now you are one of several stores they are comparing.

Hank shares what he hears from the desk every day: the reps who win the unsold customer are the ones who follow up with something useful, not something pushy. Mark walks through the difference between "just checking in" and a message that answers the question the customer left with.

Try this today: before an unsold guest leaves, ask what would have to be true for them to buy. Write it down. That is your follow-up.$t$,
   'unsold-follow-up', 8, '2026-09-02', 0, now()),
  ('the-internet-lead-reply-that-gets-answered', 2,
   $t$The Internet Lead Reply That Gets Answered$t$,
   $t$Today's internet shopper already knows the price, the trim and the trade value range. Your first reply has to respect that. Here is how to write one that sounds like a person, not a template.$t$,
   $t$Customers send a lead after weeks of research. When they get a canned response that ignores their question, they move on to the next store.

Mark breaks down the three parts of a first reply that works: answer their question, show you read it, and offer one easy next step. Hank explains why "When can you come in?" is the wrong first question.

Try this today: reread your last five lead replies. Did each one answer what the customer actually asked?$t$,
   'internet-leads', 7, '2026-09-09', 0, now()),
  ('the-road-to-the-sale-isnt-dead', 3,
   $t$The Road to the Sale Isn't Dead. It Changed.$t$,
   $t$Customers who show up knowing the numbers do not want to be walked through ten steps. They still need a process. Mark and Hank talk about which steps to shorten, which to skip, and which matter more than ever.$t$,
   $t$Veterans learned a road to the sale that worked for years. Then customers changed. Some reps dropped the process completely. That is a mistake too.

Hank explains why the meet-and-greet and the needs conversation matter more now, not less, and Mark covers how to run a walkaround for someone who has already watched three video reviews of the car.

Try this today: ask your next customer what they have already done online, and start from there.$t$,
   'road-to-the-sale', 9, '2026-09-16', 0, now()),
  ('your-crm-is-not-a-to-do-list', 4,
   $t$Your CRM Is Not a To-Do List$t$,
   $t$Clearing tasks is not the same as following up. Mark and Hank show how to use CRM notes so every call and text picks up where the last conversation left off.$t$,
   $t$Most reps treat the CRM like a chore: log the call, clear the task, move on. The customer can tell.

Mark shares how the best follow-up teams write notes that make the next touch personal: what the customer said, what they are worried about, and what you promised. Hank adds what managers look for when they open a deal that has gone cold.

Try this today: for your five hottest customers, add one line to the notes about what matters to them most.$t$,
   'crm-follow-up', 6, '2026-09-23', 0, now()),
  ('answer-the-phone-like-you-want-the-appointment', 5,
   $t$Answer the Phone Like You Want the Appointment$t$,
   $t$An inbound sales call is the warmest lead you will get all day, and most of them end with a price and no appointment. Here is how to answer the price question and still give the caller a reason to come in.$t$,
   $t$Mark has listened to thousands of dealership calls. The pattern is the same: the caller asks about a car, the rep answers, and the call ends. No name, no number, no appointment.

Mark and Hank walk through a better inbound call: answer the question honestly, ask one good question back, and offer two specific times to see the car.

Try this today: on your next inbound call, get the caller's name in the first 30 seconds.$t$,
   'inbound-calls', 8, '2026-09-30', 0, now()),
  ('outbound-calls-without-the-cringe', 6,
   $t$Outbound Calls Without the Cringe$t$,
   $t$Nobody likes making outbound calls, and customers can hear it. Mark and Hank share how to open a call with a reason the customer cares about, and how to leave a voicemail worth calling back.$t$,
   $t$Outbound calls get a bad reputation because most of them sound the same. "Just following up" gives the customer nothing.

Hank talks about the calls he makes from the desk to save deals, and Mark shares the voicemail structure his BDC clients use: who you are, why you are calling, and one specific reason to call back.

Try this today: write the first sentence of your next five outbound calls before you dial.$t$,
   'outbound-calls', 7, '2026-10-07', 0, now()),
  ('when-customers-are-told-not-to-trust-you', 7,
   $t$When Customers Are Told Not to Trust You$t$,
   $t$Buyer-advocate services and online forums tell shoppers to avoid salespeople. Mark and Hank talk honestly about why that happens, what we can't defend, and how to build a career anyway, one customer at a time.$t$,
   $t$Some customers now pay someone just to avoid talking to you. That stings. It is also information.

Mark and Hank do not bash the advocates and do not defend the bad stuff that created them. They talk about what a customer is really buying when they pay to skip the salesperson, and how to earn the trust back face to face.

Try this today: ask a sold customer what almost made them buy somewhere else. Then listen.$t$,
   'career', 10, '2026-10-14', 0, now());

COMMIT;
