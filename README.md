# 🛡️ Cybersecurity Internship — Phase 2

> **Advanced Threat Detection, Web API Security Hardening & Compliance Auditing**  
> Weeks 4 · 5 · 6 — Kali Linux · Node.js · Express.js

---

## 👤 Intern Details

| Field | Detail |
|---|---|
| **Name** | Hafiza Hanana Rao |
| **Intern ID** | DCH-1307 |
| **Program** | Cybersecurity Internship — Phase 2 |
| **Environment** | VMware Workstation · Kali Linux |
| **Target Stack** | Node.js · Express.js · `http://localhost:5000` |

---

## 📁 Repository Structure

```
cyber-security-lab/
│
├── app.js                          # Main hardened Express application
├── package.json
├── package-lock.json
│
├── docs/
│   ├── Week4_Technical_Evaluation_Report.docx
│   ├── Week5_Lab_Report.docx
│   ├── Week6_Lab_Report.docx
│   
└── README.md
```

---

## 📋 Overview

This repository documents the complete security engineering lifecycle carried out during Phase 2 of the cybersecurity internship. Across three weeks, the project progressed from building foundational defensive infrastructure to conducting active penetration tests and performing full production compliance auditing.

| Week | Focus | Key Tools |
|---|---|---|
| **Week 4** | Threat Detection & API Hardening | Fail2Ban · Helmet.js · CORS · Rate Limiting |
| **Week 5** | Vulnerability Assessment & CSRF Mitigation | NMAP · SQLMap · csurf · cookie-parser · cURL |
| **Week 6** | System Auditing & Deployment Compliance | Nikto · OWASP ZAP · Lynis · npm audit |

---

## 🔐 Week 4 — Threat Detection & API Security Hardening

### Objectives
- Deploy host-level intrusion prevention using **Fail2Ban**
- Harden the Node.js Express API with security middlewares

### Fail2Ban Configuration

Custom jail rules defined in `/etc/fail2ban/jail.local`:

```ini
[DEFAULT]
bantime  = 10m
findtime = 10m
maxretry = 5
destemail = hanana.bahrian@gmail.com
sender   = fail2ban@localhost
action   = %(action_mw)s
```

| Parameter | Value | Description |
|---|---|---|
| `bantime` | 10 minutes | Duration an offending IP is blocked |
| `findtime` | 10 minutes | Time window for counting failures |
| `maxretry` | 5 attempts | Max failures before auto-ban triggers |
| `action` | `%(action_mw)s` | Ban + email notification |

### Express.js Security Middleware Stack

```bash
npm install helmet cors express-rate-limit
```

```js
const helmet    = require('helmet');
const cors      = require('cors');
const rateLimit = require('express-rate-limit');

// Security headers (XSS, HSTS, CSP, etc.)
app.use(helmet());

// CORS — restrict to trusted origin only
app.use(cors({ origin: 'http://localhost:3000' }));

// Rate limiting — 100 requests per 15 min per IP
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use(limiter);
```

| Middleware | Protection |
|---|---|
| `helmet()` | Sets HTTP security headers (CSP, HSTS, X-Frame-Options, etc.) |
| `cors()` | Blocks unauthorized cross-origin requests |
| `express-rate-limit` | Prevents brute-force & DoS attacks |

### Week 4 Deliverables

- [x] Fail2Ban jail configured and active
- [x] Helmet, CORS, and Rate Limiting middleware integrated
- [x] Server running cleanly on Port 5000 — no errors

---

## 🔍 Week 5 — Vulnerability Assessment & CSRF Mitigation

### Objectives
- Perform active port reconnaissance with **NMAP**
- Run automated SQL Injection testing with **SQLMap**
- Implement **CSRF protection** using cryptographic tokens

### NMAP Port Scan

```bash
nmap -sV -p 5000 localhost
```

**Result:** Port 5000 confirmed open, Node.js/Express service banner identified. No unexpected services exposed.

### SQL Injection Test (SQLMap)

A test endpoint was intentionally constructed with a raw string interpolation vulnerability:

```js
app.get('/api/search', (req, res) => {
    const userQuery = req.query.q;
    const sqlQuery = `SELECT * FROM items WHERE name = '${userQuery}'`;
    res.json({ status: "Testing SQLi", executedQuery: sqlQuery });
});
```

```bash
sqlmap -u "http://localhost:5000/api/search?q=test" -p q --batch
```

**Result:**
```
[CRITICAL] all tested parameters do not appear to be injectable.
```

> The application returns query strings in a mock JSON payload rather than executing them against a live database engine — no injection vulnerability was confirmed.

### CSRF Protection

```bash
npm install cookie-parser csurf
```

```js
const cookieParser = require('cookie-parser');
const csrf         = require('csurf');

app.use(cookieParser());
const csrfProtection = csrf({ cookie: true });

// Token issuance endpoint
app.get('/api/csrf-token', csrfProtection, (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});

// Protected state-changing endpoint
app.post('/api/update-settings', csrfProtection, (req, res) => {
    res.json({ status: "Success", message: "Action cleared validation!" });
});
```

**Verification — cURL attack simulation without a valid token:**

```bash
curl -X POST http://localhost:5000/api/update-settings
```

**Response:**
```html
<pre>ForbiddenError: invalid csrf token</pre>
```

✅ Unauthorized POST request was rejected at the middleware layer.

### Week 5 Deliverables

- [x] NMAP reconnaissance completed — service confirmed on Port 5000
- [x] SQLMap injection test — all parameters confirmed safe
- [x] CSRF token middleware implemented and penetration-tested

---

## 🔬 Week 6 — Advanced Audits & Final Deployment Compliance

### Objectives
- Audit web server headers with **Nikto**
- Run DAST scanning with **OWASP ZAP**
- Audit host OS security posture with **Lynis**
- Verify dependency supply chain with **npm audit**

### Nikto Web Server Scan

```bash
nikto -h http://localhost:5000
```

**Results:**
- ✅ `Server:` banner suppressed — no Express/Node.js version leak
- ✅ CORS policy verified — access restricted to `http://localhost:3000` only
- ✅ Security headers from `helmet()` confirmed active

### OWASP ZAP — Dynamic Application Security Testing

Automated black-box scanning across all active API endpoints.

**Results:**
- ✅ Zero high-severity OWASP Top 10 vulnerabilities detected
- ✅ All GET/POST routes returning properly structured JSON responses
- ✅ No injections, misconfigurations, or information disclosures found

### Lynis Host Hardening Audit

```bash
sudo lynis audit system
```

**Result:**

| Metric | Value |
|---|---|
| Tests performed | 275 |
| **Hardening Index** | **64 / 100** |
| Status | ✅ Securely anchored baseline |

The audit covered: kernel parameters, file system permissions, boot configuration, cron jobs, user/group policies, and network settings.

### npm Dependency Audit

```bash
npm audit
```

**Result:** Zero high or critical vulnerabilities found across all production dependencies including `helmet`, `csurf`, `cors`, and `cookie-parser`.

```
found 0 vulnerabilities
```

### Week 6 Deliverables

- [x] Nikto scan — banner suppression and CORS restriction verified
- [x] OWASP ZAP DAST — zero critical vulnerabilities
- [x] Lynis hardening audit — Index 64 across 275 test matrices
- [x] npm audit — clean dependency supply chain

---

## ✅ Final Compliance Summary

| Task | Week | Status |
|---|---|---|
| Fail2Ban intrusion prevention configured | 4 | ✅ Complete |
| Helmet + CORS + Rate Limiting middleware active | 4 | ✅ Complete |
| Server verified running on Port 5000 | 4 | ✅ Complete |
| NMAP port reconnaissance completed | 5 | ✅ Complete |
| SQLMap injection test — all params safe | 5 | ✅ Complete |
| CSRF protection implemented & tested | 5 | ✅ Complete |
| Nikto web server audit passed | 6 | ✅ Complete |
| OWASP ZAP DAST — zero high-risk findings | 6 | ✅ Complete |
| Lynis host hardening — Index 64 | 6 | ✅ Complete |
| npm audit — zero critical vulnerabilities | 6 | ✅ Complete |

---

## 🛠️ Tech Stack

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=flat&logo=express&logoColor=white)
![Kali Linux](https://img.shields.io/badge/Kali_Linux-557C94?style=flat&logo=kalilinux&logoColor=white)
![OWASP](https://img.shields.io/badge/OWASP-000000?style=flat&logo=owasp&logoColor=white)
![npm](https://img.shields.io/badge/npm-CB3837?style=flat&logo=npm&logoColor=white)

---

## 📄 Reports

All lab documentation is available in the `/docs` folder:

- [`Week4_Technical_Evaluation_Report.docx`](./docs/Week4_Technical_Evaluation_Report.docx)
- [`Week5_Lab_Report.docx`](./docs/Week5_Lab_Report.docx)
- [`Week6_Lab_Report.docx`](./docs/Week6_Lab_Report.docx)

---

> *Confidential — Cybersecurity Internship Phase 2 · Hafiza Hanana Rao · DCH-1307*
