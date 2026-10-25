# Roadmap

The current build is a local prototype with login/account administration, a learner register, a scoped CBC mark workflow and a basic audited invoice/payment/receipt workflow. It is not the complete Mary Royal SMS from the brief and is not ready for real learner or finance data.

- Expand data models for guardians, full learner details, school years/terms, formal classes/streams/subjects and multi-role grants. Link demo parent/learner accounts to children.
- Finish Director accounts with printable credential slips, bulk CSV/Excel import validation, role grants and session revocation. Basic create, suspend/reactivate, reset and unlock work.
- Complete server-side authorization and row scoping for every route/action. Test all role/action combinations, linked child and assigned class IDOR attempts, audit access and data exports. Add durable rate limits, idle timeout, CSP nonce policy and privacy/access workflows.
- Finish academic setup and attendance, including teacher assignments managed by the Director/Head Teacher, class registers, edit approval and attendance follow-up.
- Complete CBC configuration, deadlines/reopen approval, strand/competency catalog, bulk marks entry/import, immutable history review, term report cards, PDF branding and released-results family access.
- Build fee structures/templates, adjustments, Director-approved waivers, expenses/payroll, statements and finance PDF/Excel reports. Current invoice lines, payment methods, unique M-Pesa code, carry-forward credit, sequential receipt, history, void reason and print receipt exist; receipt void is blocked after credit use pending reconciliation.
- Build clash-checked timetable, duty/cover, discipline, notifications/announcements, moderated messages, lesson plans, homework/resources and events.
- Complete Parent and Learner portals with secure guardian links; build role-specific analytics, search, exports and real notifications.
- Add offline PWA caching, accessibility and performance reviews, backup/restore verification, privacy notice/data requests, finished role guides and operational hardening. docs/DEPLOYMENT_GUIDE.md is a later planning guide only.
