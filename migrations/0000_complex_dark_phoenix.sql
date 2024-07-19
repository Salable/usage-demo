CREATE TABLE `Organisations` (
	`uuid` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `Tokens` (
	`uuid` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`organisationUuid` text NOT NULL,
	`userUuid` text NOT NULL,
	FOREIGN KEY (`organisationUuid`) REFERENCES `Organisations`(`uuid`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`userUuid`) REFERENCES `Users`(`uuid`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `UsersOrganisations` (
	`userUuid` text NOT NULL,
	`organisationUuid` text NOT NULL,
	FOREIGN KEY (`userUuid`) REFERENCES `Users`(`uuid`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`organisationUuid`) REFERENCES `Organisations`(`uuid`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `Users` (
	`uuid` text PRIMARY KEY NOT NULL,
	`username` text,
	`email` text,
	`salt` text,
	`hash` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Organisations_uuid_unique` ON `Organisations` (`uuid`);--> statement-breakpoint
CREATE UNIQUE INDEX `Organisations_name_unique` ON `Organisations` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `Tokens_uuid_unique` ON `Tokens` (`uuid`);--> statement-breakpoint
CREATE UNIQUE INDEX `Tokens_value_unique` ON `Tokens` (`value`);--> statement-breakpoint
CREATE UNIQUE INDEX `Users_uuid_unique` ON `Users` (`uuid`);--> statement-breakpoint
CREATE UNIQUE INDEX `Users_username_unique` ON `Users` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `Users_email_unique` ON `Users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `Users_salt_unique` ON `Users` (`salt`);--> statement-breakpoint
CREATE UNIQUE INDEX `Users_hash_unique` ON `Users` (`hash`);