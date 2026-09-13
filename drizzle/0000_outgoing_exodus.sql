CREATE TABLE `classroom` (
	`id` integer PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`name` text NOT NULL,
	`enabled` integer DEFAULT 1 NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `rate_limits` (
	`key` text NOT NULL,
	`slot` integer NOT NULL,
	`count` integer NOT NULL,
	PRIMARY KEY(`key`, `slot`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`student_number` integer NOT NULL,
	`status` text NOT NULL,
	`result_json` text,
	`photo_keys` text NOT NULL,
	`created_at` integer NOT NULL,
	`handoff` text DEFAULT '' NOT NULL,
	`done_ids` text DEFAULT '[]' NOT NULL,
	`teacher_comment` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_reviews_session_created` ON `reviews` (`session_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_reviews_created` ON `reviews` (`created_at`);--> statement-breakpoint
CREATE TABLE `student_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`student_number` integer NOT NULL,
	`expires_at` integer NOT NULL
);
