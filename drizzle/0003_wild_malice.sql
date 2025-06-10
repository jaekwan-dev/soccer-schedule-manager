CREATE TABLE "members" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"level" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
