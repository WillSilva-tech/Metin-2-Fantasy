CREATE TABLE "admin_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_uid" text NOT NULL,
	"action" text NOT NULL,
	"details" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cash_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"amount" integer NOT NULL,
	"status" text NOT NULL,
	"provider" text NOT NULL,
	"external_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "characters" (
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
--> statement-breakpoint
CREATE TABLE "coupon_redemptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"coupon_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"redeemed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coupons" (
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
--> statement-breakpoint
CREATE TABLE "events" (
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
--> statement-breakpoint
CREATE TABLE "guilds" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"leader_nick" text NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"kingdom" text NOT NULL,
	"rank" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "guilds_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "news" (
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
--> statement-breakpoint
CREATE TABLE "server_status" (
	"id" serial PRIMARY KEY NOT NULL,
	"status" text DEFAULT 'online' NOT NULL,
	"player_count" integer DEFAULT 128 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"uid" text NOT NULL,
	"email" text NOT NULL,
	"login" text NOT NULL,
	"role" text DEFAULT 'PLAYER' NOT NULL,
	"cash_balance" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_uid_unique" UNIQUE("uid")
);
--> statement-breakpoint
CREATE TABLE "videos" (
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
--> statement-breakpoint
ALTER TABLE "cash_transactions" ADD CONSTRAINT "cash_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "characters" ADD CONSTRAINT "characters_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_coupon_id_coupons_id_fk" FOREIGN KEY ("coupon_id") REFERENCES "public"."coupons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;