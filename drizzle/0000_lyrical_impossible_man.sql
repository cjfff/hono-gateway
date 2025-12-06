CREATE TABLE `gateways_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`target` text NOT NULL,
	`isRewrite` integer DEFAULT 0 NOT NULL,
	`status` integer DEFAULT 1 NOT NULL,
	`timestamp` text DEFAULT (current_timestamp) NOT NULL
);
