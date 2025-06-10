CREATE TABLE "matches" (
	"id" text PRIMARY KEY NOT NULL,
	"date" text NOT NULL,
	"time" text NOT NULL,
	"venue" text NOT NULL,
	"vote_deadline" text NOT NULL,
	"attendance_votes" json DEFAULT '{"attend":0,"absent":0}'::json NOT NULL,
	"voters" json DEFAULT '[]'::json NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
