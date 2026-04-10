-- Reconcile schema changes that were applied manually while Prisma schema
-- history was blocked by the Windows schema engine.

ALTER TABLE `service_providers`
    ADD COLUMN `verification_notes` VARCHAR(255) NULL AFTER `verification_status`,
    ADD COLUMN `verified_at` DATETIME(3) NULL AFTER `verification_notes`,
    ADD COLUMN `rejected_at` DATETIME(3) NULL AFTER `verified_at`;

ALTER TABLE `appointments`
    ADD COLUMN `meeting_type` VARCHAR(30) NULL AFTER `status`;

ALTER TABLE `messages`
    ADD COLUMN `attachment_url` VARCHAR(600) NULL AFTER `body`,
    ADD COLUMN `attachment_name` VARCHAR(255) NULL AFTER `attachment_url`,
    ADD COLUMN `attachment_mime_type` VARCHAR(120) NULL AFTER `attachment_name`,
    ADD COLUMN `attachment_size_bytes` BIGINT UNSIGNED NULL AFTER `attachment_mime_type`,
    ADD COLUMN `delivered_at` DATETIME(3) NULL AFTER `status`;
