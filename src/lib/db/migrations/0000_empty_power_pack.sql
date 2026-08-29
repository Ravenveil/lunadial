CREATE TABLE "users" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"email" varchar(256),
	"name" text,
	"avatar_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "env_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"night_id" integer NOT NULL,
	"user_id" varchar(128) NOT NULL,
	"ts" varchar(5) NOT NULL,
	"temp" real NOT NULL,
	"humidity" real NOT NULL,
	"lux" real NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"night_id" integer NOT NULL,
	"user_id" varchar(128) NOT NULL,
	"ts" time NOT NULL,
	"kind" varchar(12) NOT NULL,
	"intensity" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nights" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(128) NOT NULL,
	"date" date NOT NULL,
	"sleep_latency_min" integer NOT NULL,
	"light_window_hit" boolean NOT NULL,
	"moon_phase" varchar(24) NOT NULL,
	"moon_age" real NOT NULL,
	"tip_text" text NOT NULL,
	"watches" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scripts" (
	"user_id" varchar(128) PRIMARY KEY NOT NULL,
	"sleep_time" varchar(5) DEFAULT '23:00' NOT NULL,
	"sunset_duration" integer DEFAULT 30 NOT NULL,
	"alarm_time" varchar(5) DEFAULT '06:40' NOT NULL,
	"sunrise_lead" integer DEFAULT 20 NOT NULL,
	"moon_phase_companion" boolean DEFAULT true NOT NULL,
	"drum_fifth_watch" boolean DEFAULT true NOT NULL,
	"guide" jsonb NOT NULL,
	"volume" integer DEFAULT 42 NOT NULL,
	"fade_with_sunset" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "env_logs_night_idx" ON "env_logs" USING btree ("night_id");--> statement-breakpoint
CREATE INDEX "events_night_idx" ON "events" USING btree ("night_id");--> statement-breakpoint
CREATE INDEX "nights_user_date_idx" ON "nights" USING btree ("user_id","date");