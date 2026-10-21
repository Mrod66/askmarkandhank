-- Fake starter data for the PREVIEW Database only: the editor runs it after
-- `npx prisma migrate reset`, or on demand with `npx prisma db seed`.
-- Live data never comes from here. Safe to run twice: each block only fills an
-- empty table.
INSERT INTO "questions" ("name", "role", "dealership", "body", "ok_to_feature")
SELECT v.name, v.role, v.dealership, v.body, v.ok
FROM (VALUES
  ('Sample Dana', 'new-rep', 'example.com test store',
   'A customer came in with a printout from a buyer service and would not talk to me. What do I say first?', true),
  ('Sample Luis', 'bdc', '',
   'How do I get an inbound caller to give me their name before they hang up with just a price?', false)
) AS v(name, role, dealership, body, ok)
WHERE NOT EXISTS (SELECT 1 FROM "questions");
