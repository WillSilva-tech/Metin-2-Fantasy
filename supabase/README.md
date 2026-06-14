# Portal Fantasy2 - Supabase Migrations & Database Setup

This folder contains configuration files, tools, and SQL migration files to integrate and set up the **Supabase PostgreSQL** database with the **Fantasy2** application.

The database is defined using Drizzle ORM at `src/db/schema.ts` and managed via Drizzle Kit. We support multiple strategies to set up your Supabase database:

---

## 🚀 Strategy 1: Direct SQL Execution (Recommended & Quick)

This is the fastest method to set up your database using the web interface without installing anything locally.

1. Go to your [Supabase Dashboard](https://supabase.com).
2. Click on the **SQL Editor** tab from the left sidebar.
3. Click **New Query** to create a blank editor page.
4. Open the file `/supabase/migrations/20260613000000_initial_schema.sql` in this project.
5. Copy the entire contents of that file and paste it into the Supabase SQL editor.
6. Click **Run** on the bottom right.
7. Done! All 11 tables and their respective foreign keys will be created instantly.

---

## 🛠️ Strategy 2: Automated via Drizzle Kit (Developer Workflow)

If you have configured your `.env` or `.env.local` to point to your Supabase instance via `DATABASE_URL` (using your Supabase Transaction Connection Pooler or Session connection string), you can automatically sync changes with a single command.

Make sure you have `DATABASE_URL` configured:
```env
DATABASE_URL=postgres://postgres.[YOUR_PROJECT_REF]:[YOUR_PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require
```

Then run the following commands:

### 1. Generate a new migration file
If you update any table schemas in `src/db/schema.ts`:
```bash
npm run db:generate
```

### 2. Push schema changes directly to Supabase
This synchronizes your local schema definitions with the live Supabase instance:
```bash
npm run db:push
```

### 3. Browse and edit data via Drizzle Studio
To open an elegant, lightweight visual interface to check database rows, add admins, or edit players:
```bash
npm run db:studio
```

---

## 🐋 Strategy 3: Supabase Local-first CLI Migrations

If you are using the local Supabase CLI development workflow, you can simply initialize and apply changes:

1. Copy the contents of `/supabase/migrations/20260613000000_initial_schema.sql` into your local `supabase/migrations/` structure.
2. Link your project:
   ```bash
   npx supabase link --project-ref your-supabase-project-id
   ```
3. Push migrations to Supabase:
   ```bash
   npx supabase db push
   ```

---

## 📊 Summary of Created Tables

The initial schema includes the following tables designed for **Fantasy2 Portal**:
- **`users`**: Contains account profiles linked with authentication (stores account rules e.g., Player, Moderator, Game Master, Admin, and Cash credits).
- **`characters`**: Game character information synced from the database for server-wide rankings.
- **`guilds`**: Guild information for PvP rankings.
- **`news`**: CMS items for landing page updates, updates, and community news.
- **`videos`**: Media playlist entries.
- **`coupons` / `coupon_redemptions`**: Gift-code system and historical redemption trackers to prevent double-claiming.
- **`cash_transactions`**: Logs and status indicators for credits purchasing.
- **`events`**: Calendar schedule events.
- **`server_status`**: Active player counter and status display.
- **`admin_logs`**: Internal action audits for GM commands.
