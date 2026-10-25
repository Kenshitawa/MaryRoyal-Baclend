# Mary Royal SMS - Takeover Audit
**Audited:** 2026-10-25 by Antigravity (takeover from Codex)
**Method:** Git log review, full code read, build run (passed 52 routes), lint/typecheck (passed), unit tests (17/17 fixed and passing).

---

## STABILIZATION ACTIONS TAKEN
1. Fixed critical Vitest v5 + Node v26 + Windows drive-letter case mismatch bug - all 17 unit tests restored.
2. Committed uncommitted half-finished changes (UI checklist, E2E dark-mode assertions, portal-frame skip-link, error/loading/not-found pages).
3. Build: 52 routes, 0 errors.

---

## SUMMARY TABLE

| Req | Status | Key Evidence |
|-----|--------|--------------|
| R1 Secretary | PARTIAL | Permissions in matrix; dashboard weak; no pipeline UI |
| R2 Fresh Start | PARTIAL | reset/seed scripts work; Director checklist missing |
| R3 Navigation | PARTIAL | Back/breadcrumb done; filter preservation incomplete |
| R4 Admission | PARTIAL | 7-step wizard done; photo crop, invoice preview missing |
| R5 Profiles | PARTIAL | Role-scoped tabs done; charts, photo crop missing |
| R6 Exams/Rubrics | MISSING | Daily attendance done; exam sessions, rubrics not built |
| R7 Complaints | PARTIAL | Core access done; attachments, notifications missing |
| R8 KICD Videos | PARTIAL | Library done; YouTube Data API, mastery weighting missing |
| R9 Finance | PARTIAL | Fee structures done; invoice stepper, PDF, discounts missing |
| R10 Design | MISSING | Dark mode exists; Bento/Glass themes, charts, animations not built |

---

## WHAT CODEX BUILT (DONE)
- All 8 roles with permissions matrix (permissions.ts)
- Multi-step 7-step admission wizard (50KB, draft autosave)
- Learner profiles with role-scoped tabs (Overview/Parents/Residence/Health/Documents/Attendance/Academics/Fees/Discipline/Timeline)
- Staff profiles with TSC/qualifications/assignments/attendance
- KICD video library with oEmbed verification against edutvkenya channel
- Versioned fee structures per class/term
- Invoice/payment/void workflows
- Parent complaint channel (Parent-only, HT+Director leadership)
- School-wide daily attendance overview
- Staff attendance capture
- Navigation: breadcrumbs, back button, route history, mobile nav
- Dark mode (blue-based)
- Basic print styles for receipts
- Unit tests: permissions, domain rules, admission validation, KICD URL parsing
- E2E tests: 9/9 passing (admission, payments, complaints, attendance, learning, role access, back-nav)

---

## WHAT NEEDS TO BE BUILT (MISSING/PARTIAL)

### Critical Missing (BLOCKING)
1. Exam sessions (Deputy creates, teachers filtered to active exam) - R6
2. Rubrics (Deputy defines CBC scale; central versioned rubrics) - R6
3. Bento/Glass dual theme system with reusable components - R10
4. Invoice stepper wizard (structure-driven, with optional items, preview) - R9
5. Director Getting Started checklist on dashboard - R2
6. Attendance analytics: date range, stream/gender, absentee follow-up - R6

### Important Missing
7. PDF receipts with QR code (currently print-to-PDF only) - R9
8. Discounts/waivers with Director approval workflow - R9
9. Recharts/charts on all dashboards - R10
10. Command palette (Ctrl+K global search) - R10
11. Collection analytics dashboard for Accountant/Head Teacher/Director - R9
12. Complaint attachments and reply notifications - R7
13. Finance dashboard (collections, arrears, trend charts) - R9

### Polish (PARTIAL to DONE)
14. Photo crop tool in admission - R4
15. M-Pesa duplicate code check - R9
16. Role dashboards redesigned in new design language - R10
17. All tables: sticky header, sort, pagination, bulk actions - R10
18. Framer-motion animations on all pages - R10
19. Print styles for lists, reports, admission form - R10

---

## IMPLEMENTATION PHASES
- Phase 1: Install dependencies (recharts, framer-motion), design system foundation
- Phase 2: Bento theme + role dashboards redesigned + Director checklist
- Phase 3: Glass theme + login page + parent/learner portals
- Phase 4: Exam sessions + rubrics (Deputy workflow)
- Phase 5: Finance stepper + discounts + PDF receipts + analytics
- Phase 6: Attendance analytics completion
- Phase 7: Complaints completion, admission photo crop
- Phase 8: Tables/forms upgrade, command palette
- Phase 9: Tests for all new features, production build, final commit
