CREATE TABLE `Organisations` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `Tokens` (
	`id` integer PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`organisationId` integer NOT NULL,
	`userId` integer NOT NULL,
	FOREIGN KEY (`organisationId`) REFERENCES `Organisations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`userId`) REFERENCES `Users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `UsersOrganisations` (
	`userId` integer NOT NULL,
	`organisationId` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `Users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`organisationId`) REFERENCES `Organisations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `Users` (
	`id` integer PRIMARY KEY NOT NULL,
	`username` text,
	`email` text,
	`salt` text,
	`hash` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Organisations_name_unique` ON `Organisations` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `Tokens_value_unique` ON `Tokens` (`value`);--> statement-breakpoint
CREATE UNIQUE INDEX `Users_username_unique` ON `Users` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `Users_email_unique` ON `Users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `Users_salt_unique` ON `Users` (`salt`);--> statement-breakpoint
CREATE UNIQUE INDEX `Users_hash_unique` ON `Users` (`hash`);