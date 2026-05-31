# Pathology Lab Portal — Deploy Guide

## Kya badla?
- Manus OAuth → Email OTP login (nodemailer)
- Manus S3 → Supabase Storage (free 1GB)
- Manus plugins → Standard Vite config
- Manus notifications → Console log (email extend kar sakte hain)

---

## Step 1: Gmail App Password banao

1. Gmail → Settings → Security → 2-Step Verification ON karein
2. Phir "App Passwords" mein jaao
3. "Mail" aur "Windows Computer" select karo → Generate
4. Woh 16-digit password `SMTP_PASS` mein daalo

---

## Step 2: Supabase Storage setup

1. https://supabase.com → New project banao (free)
2. Left menu → "Storage" → "New Bucket" → naam: `lab-reports`
3. Bucket ko **Public** rakho (ya private with signed URLs)
4. Settings → API → Project URL = `SUPABASE_URL`
5. Settings → API → `service_role` key = `SUPABASE_SERVICE_KEY`

---

## Step 3: Railway pe deploy

1. https://railway.app → GitHub se sign up
2. New Project → Deploy from GitHub repo
3. + New → Database → MySQL add karo
4. Project Settings → Variables mein ye sab daalo (`.env.example` dekho)
5. Settings → Build Command: `pnpm install && pnpm build && pnpm db:push`
6. Settings → Start Command: `pnpm start`

---

## Step 4: Pehla Admin banao

Railway deploy hone ke baad:
1. Login karein apni email se
2. Railway → MySQL → Connect → SQL run karein:

```sql
UPDATE users SET role = 'admin' WHERE email = 'aapka@email.com';
```

---

## Local Development

```bash
cp .env.example .env
# .env mein apni values bharo

pnpm install
pnpm db:push
pnpm dev
```
