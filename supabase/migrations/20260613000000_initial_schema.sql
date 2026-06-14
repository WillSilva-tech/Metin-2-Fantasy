-- Initial migration to set up the DB tables for the fantasy2 (Metin2) Applet
-- Targets Supabase PostgreSQL instance

-- 1. Users Table
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"uid" text NOT NULL,
	"email" text NOT NULL,
	"login" text NOT NULL,
	"role" text DEFAULT 'PLAYER' NOT NULL,
	"cash_balance" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_uid_unique" UNIQUE("uid")
);

-- 2. Admin Logs Table for Auditing
CREATE TABLE IF NOT EXISTS "admin_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_uid" text NOT NULL,
	"action" text NOT NULL,
	"details" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- 3. Cash Transactions Table
CREATE TABLE IF NOT EXISTS "cash_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"amount" integer NOT NULL,
	"status" text NOT NULL,
	"provider" text NOT NULL,
	"external_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- 4. Characters Table for Rankings
CREATE TABLE IF NOT EXISTS "characters" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"nick" text NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"kingdom" text NOT NULL,
	"class_name" text NOT NULL,
	"played_time" text DEFAULT '0h' NOT NULL,
	"league" text DEFAULT 'Bronze' NOT NULL,
	"league_icon" text DEFAULT '⚔️' NOT NULL,
	"rank" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "characters_nick_unique" UNIQUE("nick")
);

-- 5. Coupons Table
CREATE TABLE IF NOT EXISTS "coupons" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"value" integer NOT NULL,
	"expiration" timestamp,
	"limit_use" integer,
	"used_count" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "coupons_code_unique" UNIQUE("code")
);

-- 6. Coupon Redemptions Table (History)
CREATE TABLE IF NOT EXISTS "coupon_redemptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"coupon_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"redeemed_at" timestamp DEFAULT now() NOT NULL
);

-- 7. Events Table
CREATE TABLE IF NOT EXISTS "events" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"time" text,
	"days" text NOT NULL,
	"status" text NOT NULL,
	"emoji" text,
	"description" text NOT NULL,
	"how_it_works" text,
	"dynamics" text,
	"elimination" text,
	"victory" text,
	"rewards" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- 8. Guilds Table for Rankings
CREATE TABLE IF NOT EXISTS "guilds" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"leader_nick" text NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"kingdom" text NOT NULL,
	"rank" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "guilds_name_unique" UNIQUE("name")
);

-- 9. News Table for CMS
CREATE TABLE IF NOT EXISTS "news" (
	"id" serial PRIMARY KEY NOT NULL,
	"category" text NOT NULL,
	"title" text NOT NULL,
	"excerpt" text NOT NULL,
	"content" text NOT NULL,
	"image_url" text NOT NULL,
	"date" text NOT NULL,
	"author" text DEFAULT 'GM_Staff' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- 10. Server Status Table
CREATE TABLE IF NOT EXISTS "server_status" (
	"id" serial PRIMARY KEY NOT NULL,
	"status" text DEFAULT 'online' NOT NULL,
	"player_count" integer DEFAULT 128 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- 11. Videos Table for Trailer Playlist
CREATE TABLE IF NOT EXISTS "videos" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"subtitle" text,
	"description" text,
	"category" text NOT NULL,
	"duration" text,
	"rarity" text,
	"author" text,
	"views" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Foreign Key Constraints
ALTER TABLE "cash_transactions" ADD CONSTRAINT "cash_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "characters" ADD CONSTRAINT "characters_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_coupon_id_coupons_id_fk" FOREIGN KEY ("coupon_id") REFERENCES "public"."coupons"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
