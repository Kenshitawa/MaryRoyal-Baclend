# Mary Royal SMS — remaining work

This repository is a local prototype. The Round 2 work improves its authorization model and fresh-start flow, but does not make it ready for real children’s or financial data.

## Round 2 implemented foundations

- Accountant is a distinct role again. Secretary can admit learners and explicitly create learner logins, but has read-only fee totals/balances and cannot record payments or open receipts.
- Complaint access is limited to Parent, Head Teacher, and Director. Parents can create and track private complaint threads; school leaders can reply and update status.
- Default setup creates the Director, school identity settings, and CBC EE/ME/AE/BE defaults. Optional `seed:demo` supplies synthetic records; `reset:fresh` requires explicit confirmation and preserves only the Director and defaults.
- Playwright tests cover the seeded role access matrix for selected APIs, admission/login approval, the Parent complaint channel, Accountant payment workflow, learner-scoped portals and teaching/assignment workflows.

## Still required from Upgrade Round 2

- **Navigation (U3):** consistent breadcrumbs and smart back behavior on every page; URL-backed filters and reliable list/scroll restoration; unsaved-form warnings; explicit browser back/forward coverage across role routes.
- **Admission (U4):** a persisted, autosaving multi-step admission wizard; residence, guardian, emergency contact, pick-up, health, document, consent and fee-handoff data; secure document storage and image crop; required-document checklist; branded downloadable admission PDF and draft/resume workflow. The existing form collects only name, grade and gender.
- **Profiles (U5):** full learner biography/profile tabs and staff profile data. Medical-note storage, class-teacher-only medical access and medical access audit are not modeled; current learner directory is not the requested full profile.
- **Attendance/exams/rubrics (U6):** schoolwide learner/staff attendance dashboard, date-range analytics, absentee follow-up, teacher reminders/exports; Deputy exam-session and timetable workflows; active-exam filtering; configurable/versioned rubrics and impact/reopen approval flows.
- **Complaints (U7):** attachment upload, explicit recipient fan-out for “both,” notification delivery, assignment and full conversation moderation are not implemented. Current one-way Parent-to-leadership access and reply/status workflows are implemented.
- **KICD learning library (U8):** the learner space has released results, grade-scoped teacher resources and educational quiz games, but no verified KICD-only video curation/catalogue, weak-topic recommendation, watched tracking or official-channel validation. Never present an unverified URL as KICD content.
- **Finance (U9):** versioned class/term fee structures, optional line items, invoice stepper/preview, approved discount/waiver requests, statements/aging buckets, expense management, collection-method analytics, generated PDFs/QR verification and exportable finance reports are not implemented. Existing invoices are entered manually; receipts use browser print-to-PDF.
- **Whole-system UX (U10):** page-by-page redesign and visual/accessibility audit across every role, full command-palette search, responsive sortable/paginated tables, dark-mode checks on every view, and comprehensive print behavior remain.

## Other security, operational and data gaps

- Permission tests still do not enumerate every route/action/IDOR for every role. The latest E2E sweep covers selected sensitive endpoints only. Add direct URL and IDOR tests for all nested records, receipt privacy, learner-profile tabs and future modules.
- Append-only audit is enforced in application workflows, not at the database layer. Login rate limiting is process-local; durable lockout, idle-session revocation/sign-out-all-devices and session/device history need stronger storage and tests.
- Finish data-subject export/correction/deletion/anonymization workflow, retention controls, approved privacy notice, secure admission-document retention and encrypted backup/restore verification before real data use.
- The current deployment schema is configured for SQLite. The Round 2 migration is a SQLite incremental migration; PostgreSQL deployment needs a tested provider-specific migration path before a one-line database URL switch can be promised.
- Assignment auto-marking is exact-answer matching only. Optional AI needs a locally installed Ollama model. No child or school content is sent to a paid/external AI service.
- Finish `docs/guides/` for the new Accountant role and revise existing role guides for changed permissions and the clean-start walkthrough.

No deployment is performed.
