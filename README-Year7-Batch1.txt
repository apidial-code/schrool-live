YEAR 7 STAGING IMPORT BATCH 1

Scope
This batch creates Math II Year 7 only when explicitly run with --apply on staging,
then imports Division of Directed Numbers as Lesson 1, with 30 multiple-choice
questions and 31 unique Bunny video IDs. It does not import the other 27 lessons.
No Year 5/6 lessons, enrolments, pricing, payments or access settings are changed.

Agreed course structure
28 official lessons across 28 weeks. Elite: 56 Zoom sessions, two per week.
Year 5/6 revision is optional and excluded from core progression/session counts.
The included course-plan JSON proposes an order for the 28 topics. It is planning
data, not a database migration or implemented enrolment configuration.

Local validation
node scripts/import-y7-lesson-01.mjs --check
This requires only Node and does not connect to a database.

After deploying these files to schrool-platform-staging
node scripts/import-y7-lesson-01.mjs --preview
node scripts/import-y7-lesson-01.mjs --apply
Run these in the staging dyno, not directly on the Windows workstation.
Preview makes no persistent writes. Apply is transactional and repeatable:
it accepts an identical prior import, and stops on conflicting data.
It checks the exact staging APP_BASE_URL and DATABASE_URL/JAWSDB_URL match.

Checked
30 questions, ten per difficulty; five distinct options each; E is correct.
All 30 numeric answers independently recalculated.
All 31 UUIDs unique. Solution mapping uses numeric Sol1 through Sol30 ordering.
Duplicate-video rejection and non-staging configuration rejection checked.
Live database preview/apply has not been run in this workspace.
Video playback/content was not re-audited in this package.

Before student acceptance testing
Year 7 course progression, enrolment/session settings, optional revision access
and tutor-marked construction completion still require implementation/testing.
Do not describe this batch as a complete deployed Year 7 course.
