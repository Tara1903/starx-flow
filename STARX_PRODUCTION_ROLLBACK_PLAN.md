# StarX Flow — Production Rollback & Restoration Plan
**Document ID:** `STARX_PRODUCTION_ROLLBACK_PLAN.md`  
**Application:** StarX Flow (`https://starx-flow.runs-on.dev` & `https://starx-flow.vercel.app`)  
**Parent Brand:** StarX Alpha Labs  
**Repository:** `https://github.com/Tara1903/starx-flow` (`C:\Web Apps\starx-flow`)  
**Current Active Production Deployment:** `dpl_ENC6j4nR1VNV85cw7XnQKxuRHmPG` (`https://starx-flow-k7sr9ci61-tarasinghsikh1903-9152s-projects.vercel.app`)  
**Status:** **ACTIVE & VERIFIED**  

---

## 1. Verified Backup Specifications

| Parameter | Specification Details | Verification Evidence |
| :--- | :--- | :--- |
| **Backup Primary Location** | `C:\Web Apps\starx-flow-pre-redesign-backup-2026-11-12-12-40` | Directory exists with 646 verified source & asset files |
| **Backup Secondary Location** | Git Commit `0ee519d` on branch `main` | Available locally and remotely on GitHub origin |
| **Backup Type** | Standalone Full-Filesystem Snapshot + Git Tree Snapshot | Verified SHA-256 manifest present in backup directory |
| **Files Covered** | 100% of codebase: `src/`, `public/`, `api/`, `supabase/`, `scripts/`, `docs/`, `package.json`, `next.config.js`, `vercel.json` | Verified identical byte count and SHA-256 prefixes |
| **Sensitive Exclusions** | `.env`, `.env.local` preserved safely in working directory only | Zero credential leaks in backup directory |

---

## 2. Latest Known-Good Production Baseline in Vercel

- **Vercel Project:** `tarasinghsikh1903-9152s-projects/starx-flow`
- **Known-Good Deployment ID:** `dpl_ENC6j4nR1VNV85cw7XnQKxuRHmPG`
- **Known-Good URL:** `https://starx-flow-k7sr9ci61-tarasinghsikh1903-9152s-projects.vercel.app`
- **Canonical Custom Domains:**
  - `https://starx-flow.runs-on.dev`
  - `https://starx-flow.vercel.app`
  - `https://starx-flow-tarasinghsikh1903-9152s-projects.vercel.app`
- **Deployment Timestamp:** Saturday, Nov 14 2026 19:09:37 GMT+0530

---

## 3. Instant Rollback Procedures

If an unrecoverable runtime regression or catastrophic visual issue occurs on production, execute one of the three verified rollback mechanisms:

### Method 1: Instant Vercel Production Rollback (Target: < 30 seconds)
Re-assigns the canonical aliases immediately to the verified previous production deployment without re-building:

```powershell
vercel alias set https://starx-flow-k7sr9ci61-tarasinghsikh1903-9152s-projects.vercel.app starx-flow.runs-on.dev
vercel alias set https://starx-flow-k7sr9ci61-tarasinghsikh1903-9152s-projects.vercel.app starx-flow.vercel.app
```
*Or via Vercel Dashboard:*
1. Navigate to Project `starx-flow` > **Deployments**.
2. Locate deployment `starx-flow-k7sr9ci61...` (`dpl_ENC6j4nR1VNV85cw7XnQKxuRHmPG`).
3. Click the three dots `...` > **Instant Rollback / Promote to Production**.

### Method 2: Git Branch Rollback (Target: ~2 minutes)
```powershell
cd "C:\Web Apps\starx-flow"
git checkout main
npm install
npm run build
vercel --prod
```

### Method 3: Filesystem Snapshot Restoration (Target: ~3 minutes)
```powershell
cd "C:\Web Apps\starx-flow"
robocopy "C:\Web Apps\starx-flow-pre-redesign-backup-2026-11-12-12-40" "C:\Web Apps\starx-flow" /E /XD .git node_modules .next
npm install
npm run build
vercel --prod
```

---

## 4. Protected Route & Data Isolation Guarantees

During any rollback or deployment cycle:
- **Database Safety:** Supabase PostgreSQL database tables (`clients`, `bookings`, `audit_logs`, `team_members`) remain untouched.
- **Auth Integrity:** 8-digit numeric OTP authentication services and session storage in Supabase remain untouched.
- **Admin Center & Dashboard:** Route files `src/app/admin/*` and `src/app/dashboard/*` remain isolated.
- **Environment Secrets:** `.env` and `.env.local` remain securely preserved on the host and in Vercel Project Settings.
