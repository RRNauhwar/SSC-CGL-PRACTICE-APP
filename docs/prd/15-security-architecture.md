# 15 — Security Architecture

Security, privacy, and integrity by design. Because the platform holds student PII, payment data, and high-stakes test/ranking data, it must be trustworthy, compliant (India **DPDP Act**, and GDPR-aligned for good practice), and resistant to cheating.

## 1. Authentication (AuthN)

- **Methods:** phone + OTP (primary for Indian audience), Google/OAuth, email+password (Argon2id/bcrypt hashing).
- **Sessions:** short-lived access tokens (JWT) + rotating refresh tokens; secure, httpOnly cookies for web; secure storage on native.
- **MFA:** optional TOTP; enforced for admin/privileged roles.
- **Protections:** OTP rate-limiting + expiry, brute-force lockout/backoff, device/session management (view + revoke sessions), suspicious-login alerts.

## 2. Authorization (AuthZ) & RBAC

- **Roles:** learner, premium-learner, content-editor, reviewer, moderator, support, finance, analyst, admin, super-admin, institution-admin, coaching-partner.
- **Model:** RBAC with fine-grained permissions; least privilege by default; permissions checked at API gateway + service layer (defense in depth).
- **Tenant/scope isolation:** institution/coaching-partner data scoped to their tenant; users can only access their own learning data.
- **Admin separation:** admin app on separate namespace, stricter auth (MFA, IP allow-listing optional), all privileged actions in **audit_logs** (doc 14).

## 3. Data protection & encryption

- **In transit:** TLS 1.2+ everywhere (HTTPS/WSS), HSTS.
- **At rest:** DB + object storage encryption; **field-level encryption** for sensitive PII (phone, email) and payment references.
- **Secrets:** managed secrets store (Vault/cloud KMS); no secrets in code/repo; automatic rotation.
- **Key management:** envelope encryption; documented key rotation + access policy.
- **PII minimization:** collect only what's needed; pseudonymized IDs in analytics/ML; PII scrubbed from logs and AI eval sets (doc 13).

## 4. Application security

- **Input validation** + output encoding (prevent XSS/SQLi/SSRF); parameterized queries/ORM.
- **API gateway:** WAF, schema validation, **rate limiting** + quotas per user/IP/endpoint, bot detection.
- **CSRF** protection for cookie-based flows; strict CORS.
- **Dependency + code scanning:** SAST, DAST, SCA in CI; secret-scanning; container image scanning.
- **File uploads (ingestion/OCR):** validate type/size, scan for malware, isolate processing.
- **Secure headers**, CSP, subresource integrity for web.

## 5. Test integrity & anti-cheat

- **Server-authoritative timing/scoring** for ranked/live tests; client timer only advisory.
- **Live-test lockdown:** discussion of live questions locked until window closes (doc 09); randomized question/option order where appropriate.
- **Anomaly detection (P2/P3):** impossibly-fast perfect scores, answer-pattern collusion, multi-account/rank manipulation, response-time outliers → flag + review; leaderboard anti-gaming.
- **Optional proctoring hooks (P3):** camera/tab-switch monitoring for high-stakes partner exams (opt-in, privacy-reviewed).
- **Account sharing/abuse controls:** device limits, concurrent-session limits on premium.

## 6. Privacy & compliance

- **DPDP Act (India) + GDPR-aligned:** lawful basis + consent for data processing; clear privacy policy; consent for optional AI training use (default off).
- **User rights:** export, correction, deletion (right to be forgotten) — automated flows (doc 14 §7) with cascade + anonymization.
- **Minors:** if any users are under the applicable age threshold, apply verifiable parental consent and stricter data handling (see content-safety obligations).
- **Data residency:** host Indian user data in-region as required; document sub-processors.
- **Payment compliance:** PCI-DSS handled by delegating card data to certified gateways (no raw card storage); tokenization only.

## 7. Auditing, logging & monitoring

- **Audit trail:** all privileged/admin/data-access actions logged immutably (who/what/when/before-after), tamper-evident.
- **Security monitoring:** centralized logs, anomaly alerts, failed-auth spikes, privilege escalations; SIEM integration at scale.
- **Incident response:** documented runbook, severity levels, breach-notification process per DPDP/GDPR timelines, post-mortems.

## 8. Infrastructure & operational security

- **Least-privilege IAM**, network segmentation (private subnets for data stores), security groups, no public DB exposure.
- **Secrets/keys** rotated; short-lived credentials for services.
- **Backups encrypted**, restore-tested; DR runbooks (doc 12).
- **Supply-chain:** pinned dependencies, signed builds, provenance; protected main branch + mandatory review + CI security gates.
- **Environment isolation:** prod fully separated from dev/staging; no prod PII in lower envs (use synthetic/masked data).

## 9. AI-specific security (see doc 13)

- Prompt-injection/jailbreak resistance; output moderation; grounding checks to prevent misinformation.
- No cross-user data leakage in Mentor/chat; user data used only for that user.
- Abuse controls + fair-use quotas on generative features.

## 10. Threat model summary (STRIDE-lite)

| Threat | Mitigation |
|--------|------------|
| Spoofing | Strong AuthN, MFA for admins, session mgmt |
| Tampering | TLS, signed tokens, audit logs, server-authoritative scoring |
| Repudiation | Immutable audit trail |
| Information disclosure | Encryption, RBAC, PII isolation, least privilege |
| Denial of service | Rate limiting, autoscaling, WAF, CDN |
| Elevation of privilege | RBAC + gateway/service checks, minimal roles, reviews |
| Cheating/integrity | Server authority, anomaly detection, live lockdown |

## Score-impact / trust justification
Security and integrity are prerequisites for trust: honest ranks and predictions, safe personal data, and fair competition. Without them, every score-relevant feature loses credibility. This is foundational, non-optional infrastructure.
