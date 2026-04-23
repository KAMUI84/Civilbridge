-- Migration: add_payouts_and_recipient_id
-- Run this on your production MySQL database.
-- Safe to run multiple times (uses IF NOT EXISTS / IF EXISTS checks).

-- Step 1: Add PayoutStatus enum type (MySQL uses ENUM column inline, no separate type needed)

-- Step 2: Add recipient_id column to transactions table
ALTER TABLE `transactions`
  ADD COLUMN IF NOT EXISTS `recipient_id` BIGINT UNSIGNED NULL AFTER `user_id`,
  ADD CONSTRAINT IF NOT EXISTS `transactions_recipient_id_fkey`
    FOREIGN KEY (`recipient_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- Step 3: Add index on recipient_id in transactions
CREATE INDEX IF NOT EXISTS `transactions_recipient_id_idx` ON `transactions` (`recipient_id`);

-- Step 4: Create payouts table
CREATE TABLE IF NOT EXISTS `payouts` (
  `id`             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `transaction_id` BIGINT UNSIGNED NOT NULL,
  `recipient_id`   BIGINT UNSIGNED NOT NULL,
  `gross_amount`   DECIMAL(16, 2)  NOT NULL,
  `platform_fee`   DECIMAL(16, 2)  NOT NULL,
  `fee_percent`    DECIMAL(5, 2)   NOT NULL,
  `net_amount`     DECIMAL(16, 2)  NOT NULL,
  `currency`       VARCHAR(20)     NOT NULL DEFAULT 'RWF',
  `status`         ENUM('PENDING', 'PROCESSING', 'SETTLED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
  `notes`          VARCHAR(255)    NULL,
  `settled_at`     DATETIME(3)     NULL,
  `settled_by_id`  BIGINT UNSIGNED NULL,
  `created_at`     DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`     DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),
  UNIQUE KEY `payouts_transaction_id_key` (`transaction_id`),

  CONSTRAINT `payouts_transaction_id_fkey`
    FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `payouts_recipient_id_fkey`
    FOREIGN KEY (`recipient_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `payouts_settled_by_id_fkey`
    FOREIGN KEY (`settled_by_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 5: Indexes on payouts
CREATE INDEX IF NOT EXISTS `payouts_recipient_id_idx`  ON `payouts` (`recipient_id`);
CREATE INDEX IF NOT EXISTS `payouts_status_idx`        ON `payouts` (`status`);
CREATE INDEX IF NOT EXISTS `payouts_created_at_idx`    ON `payouts` (`created_at`);
