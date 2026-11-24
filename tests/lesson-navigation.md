# Lesson navigation regression

This test mounts the real lesson component and tRPC client against isolated in-memory server fixtures. It does not connect to staging or change customer records. It covers query-only lesson navigation, Easy submission, Medium Q1 saving and Q2 navigation, focus/reconnect checks, delayed reads, refresh, Resume, and browser Back.

Install the test-only DOM dependency outside the repository, then run from the repository root in PowerShell:

```powershell
npm install --prefix "$env:TEMP\schrool-navigation-test-deps" --no-package-lock --ignore-scripts jsdom@24.1.3
$env:NAV_JSDOM = "$env:TEMP\schrool-navigation-test-deps\node_modules\jsdom"
node tests/checkLessonNavigation.cjs
```

After staging deployment, use a test enrolment to repeat Easy submission, start Medium, answer Q1 and click Q2. Switch browser tabs and return; confirm the lesson and Q2 remain displayed. Refresh and Resume; confirm the Q1 answer is retained and Resume opens the first unanswered question. Check previous/next lesson navigation and browser Back. These live checks are separate from the fixture regression.
