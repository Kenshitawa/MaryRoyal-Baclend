# Deployment guide (future work)

This local prototype is not ready to deploy. Its Prisma datasource currently uses SQLite, row-level authorization and required school workflows are incomplete, and no production operational review has been completed. This guide is a planning checklist only; no hosting or deployment has been performed.

## PostgreSQL migration

1. Add a PostgreSQL datasource configuration and a checked-in Prisma migration history; this is not a one-line `DATABASE_URL` change in the current code.
2. Review SQLite-specific field types, constraints, indexes, transaction behavior, case sensitivity and sequential receipt/admission numbering against PostgreSQL.
3. Provision an empty PostgreSQL database and a restricted application user. Use TLS for database connections and keep credentials in the host's secret manager.
4. Run migrations against a staging copy, verify counts and relationships, test restore and reconcile finance totals before any production import.
5. Validate connection pooling and Prisma's production engine configuration for the chosen platform.

## Hosting choices to evaluate

Compare a managed application platform, a managed container service, and a school-managed server. Evaluate Kenya/East Africa latency, data residency and transfer terms, backups, support, uptime history, incident response, access controls, total cost and ability to export data. Select only after a privacy and security review; avoid committing to a provider from this prototype.

## HTTPS and application configuration

- Use an organization-controlled domain and managed TLS certificates; redirect HTTP to HTTPS.
- Set secure cookies and HSTS only after every public endpoint serves HTTPS correctly.
- Generate a unique secret of at least 32 random bytes for `SESSION_SECRET`; never reuse demo credentials or local `.env` values.
- Configure a production CSP without `unsafe-inline` or `unsafe-eval` (nonce or hash based), trusted origins, log retention and a strict upload allowlist.
- Keep database URLs, email/SMS credentials and storage keys in the platform secret manager. Do not add them to source control or client-side environment variables.
- Review Auth.js/session, CSRF, lockout, idle timeout, account recovery, role scoping and audit retention before accepting real pupil data.

## Backups and recovery

- Schedule encrypted PostgreSQL backups with a documented retention schedule and a separate restricted backup account.
- Keep a protected off-site copy. Define recovery point and recovery time objectives with school leadership.
- Test restore to an isolated environment regularly and reconcile learner counts, invoices, payments and audit records.
- Restrict and audit manual exports; never send unencrypted pupil or finance data through personal accounts.

## Monitoring and operations

Track uptime, latency, error rates, database storage/connections, failed sign-ins, lockouts, backup success and unusual export/access activity. Alert an assigned operator without including passwords, tokens, medical notes or other sensitive learner details in messages. Document incident response, access reviews, patch cadence, log retention, data requests and a named escalation contact before launch.
