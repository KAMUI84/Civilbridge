-- CreateTable
CREATE TABLE `users` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `full_name` VARCHAR(120) NOT NULL,
    `email` VARCHAR(190) NULL,
    `phone` VARCHAR(40) NULL,
    `password_hash` VARCHAR(255) NULL,
    `google_sub` VARCHAR(64) NULL,
    `role` ENUM('SUPER_ADMIN', 'ADMIN', 'PROFESSIONAL', 'CLIENT', 'ENGINEER', 'CONTRACTOR', 'SUPPLIER', 'ARCHITECT', 'HOME_BUILDER', 'VIEWER', 'AUDITOR', 'FINANCE', 'STUDENT') NOT NULL DEFAULT 'CLIENT',
    `region_id` BIGINT UNSIGNED NULL,
    `verification_status` ENUM('UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED') NOT NULL DEFAULT 'UNVERIFIED',
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `failed_login_attempts` INTEGER NOT NULL DEFAULT 0,
    `locked_until` DATETIME(3) NULL,
    `last_login_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    UNIQUE INDEX `users_phone_key`(`phone`),
    UNIQUE INDEX `users_google_sub_key`(`google_sub`),
    INDEX `users_role_idx`(`role`),
    INDEX `users_region_id_idx`(`region_id`),
    INDEX `users_verification_status_idx`(`verification_status`),
    INDEX `users_locked_until_idx`(`locked_until`),
    INDEX `users_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_profiles` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `profession` VARCHAR(120) NULL,
    `company_name` VARCHAR(160) NULL,
    `address_text` VARCHAR(255) NULL,
    `bio` TEXT NULL,
    `avatar_url` VARCHAR(255) NULL,
    `signature_url` VARCHAR(255) NULL,
    `license_number` VARCHAR(120) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `user_profiles_user_id_key`(`user_id`),
    INDEX `user_profiles_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_sessions` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `token_hash` VARCHAR(255) NOT NULL,
    `device_info` VARCHAR(255) NULL,
    `ip_address` VARCHAR(64) NULL,
    `expires_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `user_sessions_token_hash_key`(`token_hash`),
    INDEX `user_sessions_user_id_idx`(`user_id`),
    INDEX `user_sessions_expires_at_idx`(`expires_at`),
    INDEX `user_sessions_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `otp_codes` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `target` VARCHAR(255) NOT NULL,
    `otp_hash` VARCHAR(255) NOT NULL,
    `purpose` ENUM('register', 'login', 'reset_password', 'verify_contact') NOT NULL DEFAULT 'register',
    `expires_at` DATETIME(3) NOT NULL,
    `attempts` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `otp_codes_target_idx`(`target`),
    INDEX `otp_codes_expires_at_idx`(`expires_at`),
    INDEX `otp_codes_target_purpose_idx`(`target`, `purpose`),
    INDEX `otp_codes_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `regions` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(120) NOT NULL,
    `country` VARCHAR(120) NOT NULL DEFAULT 'Rwanda',
    `currency` VARCHAR(20) NOT NULL DEFAULT 'RWF',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `regions_name_key`(`name`),
    INDEX `regions_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `region_multipliers` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `region_id` BIGINT UNSIGNED NOT NULL,
    `scope` ENUM('MATERIAL', 'LABOR', 'TRANSPORT', 'OVERALL') NOT NULL,
    `multiplier` DECIMAL(10, 4) NOT NULL DEFAULT 1.0000,
    `active_from` DATE NOT NULL,
    `active_to` DATE NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `region_multipliers_region_id_idx`(`region_id`),
    INDEX `region_multipliers_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cost_catalog_items` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(60) NOT NULL,
    `name` VARCHAR(190) NOT NULL,
    `category` ENUM('FOUNDATION', 'STRUCTURE', 'ROOFING', 'FINISHES', 'PLUMBING', 'ELECTRICAL', 'LABOR', 'OTHER') NOT NULL,
    `unit` VARCHAR(40) NOT NULL,
    `base_unit_cost` DECIMAL(14, 2) NOT NULL,
    `default_wastage_percent` DECIMAL(6, 2) NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `cost_catalog_items_code_key`(`code`),
    INDEX `cost_catalog_items_category_idx`(`category`),
    INDEX `cost_catalog_items_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `listings` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `listing_type` ENUM('PROPERTY', 'LAND') NOT NULL,
    `title` VARCHAR(190) NOT NULL,
    `description` TEXT NULL,
    `region_id` BIGINT UNSIGNED NOT NULL,
    `location_text` VARCHAR(190) NULL,
    `price` DECIMAL(16, 2) NULL,
    `currency` VARCHAR(20) NOT NULL DEFAULT 'RWF',
    `size_m2` DECIMAL(12, 2) NULL,
    `bedrooms` INTEGER NULL,
    `bathrooms` INTEGER NULL,
    `zoning_info` VARCHAR(190) NULL,
    `status` ENUM('DRAFT', 'ACTIVE', 'PENDING', 'SOLD', 'INACTIVE', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
    `owner_user_id` BIGINT UNSIGNED NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `listings_listing_type_idx`(`listing_type`),
    INDEX `listings_region_id_idx`(`region_id`),
    INDEX `listings_owner_user_id_idx`(`owner_user_id`),
    INDEX `listings_status_idx`(`status`),
    INDEX `listings_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `listing_images` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `listing_id` BIGINT UNSIGNED NOT NULL,
    `image_url` VARCHAR(255) NOT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `listing_images_listing_id_idx`(`listing_id`),
    INDEX `listing_images_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lead_requests` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `listing_id` BIGINT UNSIGNED NOT NULL,
    `requester_user_id` BIGINT UNSIGNED NULL,
    `name` VARCHAR(120) NULL,
    `phone` VARCHAR(40) NULL,
    `email` VARCHAR(190) NULL,
    `message` TEXT NULL,
    `request_type` ENUM('MORE_INFO', 'SCHEDULE_VISIT', 'CONNECT_AGENT') NOT NULL,
    `status` ENUM('NEW', 'CONTACTED', 'CLOSED') NOT NULL DEFAULT 'NEW',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `lead_requests_listing_id_idx`(`listing_id`),
    INDEX `lead_requests_requester_user_id_idx`(`requester_user_id`),
    INDEX `lead_requests_status_idx`(`status`),
    INDEX `lead_requests_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `plans` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `category` ENUM('RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL', 'INFRA') NOT NULL,
    `title` VARCHAR(190) NOT NULL,
    `style` VARCHAR(120) NULL,
    `description` TEXT NULL,
    `built_area_m2` DECIMAL(12, 2) NOT NULL,
    `floors` INTEGER NOT NULL DEFAULT 1,
    `bedrooms` INTEGER NULL,
    `is_verified` BOOLEAN NOT NULL DEFAULT false,
    `tier` ENUM('FREE', 'PRO', 'PREMIUM') NOT NULL DEFAULT 'FREE',
    `estimated_cost_min` DECIMAL(16, 2) NULL,
    `estimated_cost_max` DECIMAL(16, 2) NULL,
    `created_by_user_id` BIGINT UNSIGNED NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `plans_category_idx`(`category`),
    INDEX `plans_created_by_user_id_idx`(`created_by_user_id`),
    INDEX `plans_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `plan_assets` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `plan_id` BIGINT UNSIGNED NOT NULL,
    `asset_type` VARCHAR(40) NOT NULL,
    `file_url` VARCHAR(255) NOT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `plan_assets_plan_id_idx`(`plan_id`),
    INDEX `plan_assets_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `plan_requests` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `plan_id` BIGINT UNSIGNED NOT NULL,
    `requester_user_id` BIGINT UNSIGNED NOT NULL,
    `request_type` ENUM('CUSTOMIZE', 'BUY_FULL_PACKAGE', 'ASK_EXPERT') NOT NULL,
    `notes` TEXT NULL,
    `status` ENUM('NEW', 'IN_REVIEW', 'ACCEPTED', 'REJECTED', 'COMPLETED') NOT NULL DEFAULT 'NEW',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `plan_requests_plan_id_idx`(`plan_id`),
    INDEX `plan_requests_requester_user_id_idx`(`requester_user_id`),
    INDEX `plan_requests_status_idx`(`status`),
    INDEX `plan_requests_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `service_providers` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `provider_type` ENUM('CONTRACTOR', 'SUPPLIER', 'ENGINEER', 'ARCHITECT') NOT NULL,
    `business_name` VARCHAR(160) NOT NULL,
    `specialties_json` JSON NULL,
    `region_id` BIGINT UNSIGNED NULL,
    `verification_status` ENUM('PENDING', 'VERIFIED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `avg_rating` DECIMAL(4, 2) NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `service_providers_user_id_key`(`user_id`),
    INDEX `service_providers_provider_type_idx`(`provider_type`),
    INDEX `service_providers_region_id_idx`(`region_id`),
    INDEX `service_providers_verification_status_idx`(`verification_status`),
    INDEX `service_providers_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `provider_reviews` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `provider_id` BIGINT UNSIGNED NOT NULL,
    `reviewer_user_id` BIGINT UNSIGNED NOT NULL,
    `rating` INTEGER NOT NULL,
    `comment` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `provider_reviews_provider_id_idx`(`provider_id`),
    INDEX `provider_reviews_reviewer_user_id_idx`(`reviewer_user_id`),
    INDEX `provider_reviews_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `projects` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `project_name` VARCHAR(160) NOT NULL,
    `project_type` ENUM('RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL', 'INFRA') NOT NULL DEFAULT 'RESIDENTIAL',
    `region_id` BIGINT UNSIGNED NOT NULL,
    `plot_size_m2` DECIMAL(10, 2) NULL,
    `built_area_m2` DECIMAL(10, 2) NOT NULL,
    `floors` INTEGER NOT NULL DEFAULT 1,
    `bedrooms` INTEGER NULL,
    `finish_level` ENUM('BASIC', 'STANDARD', 'PREMIUM') NOT NULL DEFAULT 'STANDARD',
    `structure_type` ENUM('RC_FRAME', 'MASONRY', 'STEEL_FRAME') NOT NULL DEFAULT 'RC_FRAME',
    `roof_type` ENUM('IRON_SHEETS', 'TILES', 'CONCRETE', 'OTHER') NOT NULL DEFAULT 'IRON_SHEETS',
    `status` ENUM('DRAFT', 'ESTIMATED', 'DOCUMENTS', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `projects_user_id_idx`(`user_id`),
    INDEX `projects_region_id_idx`(`region_id`),
    INDEX `projects_status_idx`(`status`),
    INDEX `projects_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project_members` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `project_id` BIGINT UNSIGNED NOT NULL,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `member_role` VARCHAR(50) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `project_members_project_id_idx`(`project_id`),
    INDEX `project_members_user_id_idx`(`user_id`),
    INDEX `project_members_member_role_idx`(`member_role`),
    INDEX `project_members_created_at_idx`(`created_at`),
    UNIQUE INDEX `project_members_project_id_user_id_key`(`project_id`, `user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `estimate_summaries` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `project_id` BIGINT UNSIGNED NOT NULL,
    `plan_id` BIGINT UNSIGNED NULL,
    `estimated_total_cost` DECIMAL(16, 2) NOT NULL,
    `cost_per_m2` DECIMAL(16, 2) NOT NULL,
    `risk_buffer_percent` DECIMAL(6, 2) NOT NULL DEFAULT 10.00,
    `risk_buffer_amount` DECIMAL(16, 2) NOT NULL,
    `final_estimated_cost` DECIMAL(16, 2) NOT NULL,
    `assumptions_json` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `estimate_summaries_project_id_key`(`project_id`),
    INDEX `estimate_summaries_plan_id_idx`(`plan_id`),
    INDEX `estimate_summaries_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project_boq_items` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `project_id` BIGINT UNSIGNED NOT NULL,
    `catalog_item_id` BIGINT UNSIGNED NULL,
    `custom_name` VARCHAR(190) NULL,
    `category` ENUM('FOUNDATION', 'STRUCTURE', 'ROOFING', 'FINISHES', 'PLUMBING', 'ELECTRICAL', 'LABOR', 'OTHER') NOT NULL,
    `unit` VARCHAR(40) NOT NULL,
    `quantity` DECIMAL(14, 3) NOT NULL,
    `unit_cost` DECIMAL(14, 2) NOT NULL,
    `total_cost` DECIMAL(16, 2) NOT NULL,
    `notes` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `project_boq_items_project_id_idx`(`project_id`),
    INDEX `project_boq_items_catalog_item_id_idx`(`catalog_item_id`),
    INDEX `project_boq_items_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project_documents` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `project_id` BIGINT UNSIGNED NOT NULL,
    `user_id` BIGINT UNSIGNED NULL,
    `doc_type` ENUM('PLAN_UPLOAD', 'BOQ_PDF', 'BOQ_EXCEL', 'FEASIBILITY_PDF', 'ESTIMATE_PDF', 'CARBON_PDF', 'ROI_PDF', 'PERMIT_FILE', 'IMAGE', 'OTHER') NOT NULL,
    `file_url` VARCHAR(255) NOT NULL,
    `storage_key` VARCHAR(255) NULL,
    `original_name` VARCHAR(190) NULL,
    `mime_type` VARCHAR(120) NULL,
    `file_size_bytes` BIGINT UNSIGNED NULL,
    `review_status` VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    `reviewed_by_user_id` BIGINT UNSIGNED NULL,
    `reviewed_at` DATETIME(3) NULL,
    `review_notes` VARCHAR(255) NULL,
    `version` INTEGER NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `project_documents_project_id_idx`(`project_id`),
    INDEX `project_documents_user_id_idx`(`user_id`),
    INDEX `project_documents_reviewed_by_user_id_idx`(`reviewed_by_user_id`),
    INDEX `project_documents_review_status_idx`(`review_status`),
    INDEX `project_documents_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project_progress_logs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `project_id` BIGINT UNSIGNED NOT NULL,
    `log_date` DATE NOT NULL,
    `stage` ENUM('FOUNDATION', 'STRUCTURE', 'ROOFING', 'FINISHES', 'PLUMBING', 'ELECTRICAL', 'OTHER') NOT NULL,
    `progress_percent` DECIMAL(6, 2) NOT NULL,
    `amount_spent` DECIMAL(16, 2) NOT NULL DEFAULT 0,
    `notes` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `project_progress_logs_project_id_idx`(`project_id`),
    INDEX `project_progress_logs_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `permit_requirements` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `region_id` BIGINT UNSIGNED NOT NULL,
    `project_type` ENUM('RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL', 'INFRA') NOT NULL,
    `permit_name` VARCHAR(190) NOT NULL,
    `authority_name` VARCHAR(190) NULL,
    `estimated_fee` DECIMAL(16, 2) NULL,
    `estimated_days` INTEGER NULL,
    `steps_json` JSON NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `permit_requirements_region_id_idx`(`region_id`),
    INDEX `permit_requirements_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project_roi_reports` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `project_id` BIGINT UNSIGNED NOT NULL,
    `expected_rent_per_month` DECIMAL(16, 2) NULL,
    `expected_sale_price` DECIMAL(16, 2) NULL,
    `maintenance_per_year` DECIMAL(16, 2) NULL,
    `vacancy_rate_percent` DECIMAL(6, 2) NOT NULL DEFAULT 0,
    `roi_percent` DECIMAL(8, 3) NOT NULL,
    `payback_years` DECIMAL(8, 3) NOT NULL,
    `break_even_months` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `project_roi_reports_project_id_key`(`project_id`),
    INDEX `project_roi_reports_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `emission_factors` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `catalog_item_id` BIGINT UNSIGNED NOT NULL,
    `co2_per_unit` DECIMAL(14, 6) NOT NULL,
    `unit` VARCHAR(40) NOT NULL,
    `source_note` VARCHAR(255) NULL,
    `active_from` DATE NOT NULL,
    `active_to` DATE NULL,

    UNIQUE INDEX `emission_factors_catalog_item_id_key`(`catalog_item_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project_carbon_summaries` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `project_id` BIGINT UNSIGNED NOT NULL,
    `total_co2_kg` DECIMAL(16, 3) NOT NULL,
    `co2_per_m2` DECIMAL(16, 3) NOT NULL,
    `transport_distance_km` DECIMAL(10, 2) NULL,
    `notes_json` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `project_carbon_summaries_project_id_key`(`project_id`),
    INDEX `project_carbon_summaries_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ai_conversations` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NULL,
    `guest_id` VARCHAR(80) NULL,
    `title` VARCHAR(190) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ai_conversations_user_id_idx`(`user_id`),
    INDEX `ai_conversations_guest_id_idx`(`guest_id`),
    INDEX `ai_conversations_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ai_messages` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `conversation_id` BIGINT UNSIGNED NOT NULL,
    `role` ENUM('USER', 'ASSISTANT', 'SYSTEM') NOT NULL,
    `content` TEXT NOT NULL,
    `meta_json` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ai_messages_conversation_id_idx`(`conversation_id`),
    INDEX `ai_messages_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `guest_chat_limits` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `guest_id` VARCHAR(80) NOT NULL,
    `message_count` INTEGER NOT NULL DEFAULT 0,
    `first_seen_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `last_seen_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `guest_chat_limits_guest_id_key`(`guest_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `uploads` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `uploaded_by_id` BIGINT UNSIGNED NOT NULL,
    `entity_type` ENUM('LISTING', 'PLAN', 'PROJECT', 'PROFILE', 'OTHER') NOT NULL,
    `entity_id` BIGINT UNSIGNED NULL,
    `file_type` ENUM('IMAGE', 'PDF', 'DOC', 'OTHER') NOT NULL,
    `mime_type` VARCHAR(120) NULL,
    `filename` VARCHAR(255) NOT NULL,
    `url` VARCHAR(600) NOT NULL,
    `size_bytes` BIGINT UNSIGNED NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `uploads_uploaded_by_id_idx`(`uploaded_by_id`),
    INDEX `uploads_entity_type_entity_id_idx`(`entity_type`, `entity_id`),
    INDEX `uploads_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_logs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NULL,
    `action` VARCHAR(80) NOT NULL,
    `entity_type` VARCHAR(60) NULL,
    `entity_id` BIGINT UNSIGNED NULL,
    `ip_address` VARCHAR(64) NULL,
    `user_agent` VARCHAR(255) NULL,
    `meta_json` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `audit_logs_user_id_idx`(`user_id`),
    INDEX `audit_logs_entity_type_entity_id_idx`(`entity_type`, `entity_id`),
    INDEX `audit_logs_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `permissions` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `description` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `permissions_name_key`(`name`),
    INDEX `permissions_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `role_permissions` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `role` ENUM('SUPER_ADMIN', 'ADMIN', 'PROFESSIONAL', 'CLIENT', 'ENGINEER', 'CONTRACTOR', 'SUPPLIER', 'ARCHITECT', 'HOME_BUILDER', 'VIEWER', 'AUDITOR', 'FINANCE', 'STUDENT') NOT NULL,
    `permission_id` BIGINT UNSIGNED NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `role_permissions_role_idx`(`role`),
    INDEX `role_permissions_permission_id_idx`(`permission_id`),
    INDEX `role_permissions_created_at_idx`(`created_at`),
    UNIQUE INDEX `role_permissions_role_permission_id_key`(`role`, `permission_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transactions` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `provider` ENUM('MTN_MOMO', 'AIRTEL_MONEY', 'STRIPE', 'MANUAL') NOT NULL DEFAULT 'MANUAL',
    `reference` VARCHAR(120) NULL,
    `invoice_number` VARCHAR(80) NULL,
    `amount` DECIMAL(16, 2) NOT NULL,
    `currency` VARCHAR(20) NOT NULL DEFAULT 'RWF',
    `type` VARCHAR(50) NOT NULL,
    `service_type` ENUM('PLAN_DOWNLOAD', 'BOQ_EXPORT', 'ENGINEER_ASSIGNMENT', 'PROJECT_MILESTONE', 'OTHER') NOT NULL DEFAULT 'OTHER',
    `service_reference` VARCHAR(120) NULL,
    `service_label` VARCHAR(160) NULL,
    `description` VARCHAR(255) NULL,
    `phone_number` VARCHAR(30) NULL,
    `provider_transaction_id` VARCHAR(191) NULL,
    `redirect_url` VARCHAR(500) NULL,
    `ussd_prompt` VARCHAR(255) NULL,
    `status` ENUM('INITIATED', 'PENDING', 'PROCESSING', 'ESCROW_HELD', 'CONFIRMED', 'FAILED', 'CANCELLED', 'RELEASE_PENDING', 'RELEASED', 'REFUND_PENDING', 'REFUNDED') NOT NULL DEFAULT 'INITIATED',
    `provider_status` VARCHAR(60) NULL,
    `webhook_status` VARCHAR(40) NULL,
    `escrow_status` ENUM('NONE', 'HELD', 'RELEASE_PENDING', 'RELEASED', 'REFUND_PENDING', 'REFUNDED') NOT NULL DEFAULT 'NONE',
    `metadata` JSON NULL,
    `held_at` DATETIME(3) NULL,
    `settled_at` DATETIME(3) NULL,
    `receipt_issued_at` DATETIME(3) NULL,
    `release_requested_at` DATETIME(3) NULL,
    `released_at` DATETIME(3) NULL,
    `milestone_stage` ENUM('FOUNDATION', 'STRUCTURE', 'ROOFING', 'FINISHES', 'PLUMBING', 'ELECTRICAL', 'OTHER') NULL,
    `milestone_approved_at` DATETIME(3) NULL,
    `refund_reference` VARCHAR(120) NULL,
    `refund_reason` VARCHAR(255) NULL,
    `refund_requested_at` DATETIME(3) NULL,
    `refunded_at` DATETIME(3) NULL,
    `failure_reason` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `transactions_reference_key`(`reference`),
    UNIQUE INDEX `transactions_invoice_number_key`(`invoice_number`),
    INDEX `transactions_user_id_idx`(`user_id`),
    INDEX `transactions_provider_idx`(`provider`),
    INDEX `transactions_status_idx`(`status`),
    INDEX `transactions_service_type_idx`(`service_type`),
    INDEX `transactions_service_reference_idx`(`service_reference`),
    INDEX `transactions_escrow_status_idx`(`escrow_status`),
    INDEX `transactions_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment_webhook_events` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `transaction_id` BIGINT UNSIGNED NULL,
    `provider` ENUM('MTN_MOMO', 'AIRTEL_MONEY', 'STRIPE', 'MANUAL') NOT NULL,
    `event_type` VARCHAR(120) NOT NULL,
    `external_event_id` VARCHAR(191) NULL,
    `signature_valid` BOOLEAN NOT NULL DEFAULT false,
    `payload` JSON NOT NULL,
    `received_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `processed_at` DATETIME(3) NULL,
    `processing_error` VARCHAR(255) NULL,

    INDEX `payment_webhook_events_transaction_id_idx`(`transaction_id`),
    INDEX `payment_webhook_events_provider_idx`(`provider`),
    INDEX `payment_webhook_events_received_at_idx`(`received_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `calendar_slots` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `provider_user_id` BIGINT UNSIGNED NOT NULL,
    `starts_at` DATETIME(3) NOT NULL,
    `ends_at` DATETIME(3) NOT NULL,
    `status` ENUM('AVAILABLE', 'HELD', 'BOOKED', 'BLOCKED', 'CANCELLED') NOT NULL DEFAULT 'AVAILABLE',
    `notes` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `calendar_slots_provider_user_id_idx`(`provider_user_id`),
    INDEX `calendar_slots_status_idx`(`status`),
    INDEX `calendar_slots_created_at_idx`(`created_at`),
    UNIQUE INDEX `calendar_slots_provider_user_id_starts_at_ends_at_key`(`provider_user_id`, `starts_at`, `ends_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `appointments` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `provider_user_id` BIGINT UNSIGNED NOT NULL,
    `client_user_id` BIGINT UNSIGNED NOT NULL,
    `project_id` BIGINT UNSIGNED NULL,
    `calendar_slot_id` BIGINT UNSIGNED NULL,
    `starts_at` DATETIME(3) NOT NULL,
    `ends_at` DATETIME(3) NOT NULL,
    `status` ENUM('REQUESTED', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW') NOT NULL DEFAULT 'REQUESTED',
    `notes` TEXT NULL,
    `cancel_reason` VARCHAR(255) NULL,
    `reminder_24h_sent_at` DATETIME(3) NULL,
    `reminder_1h_sent_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `appointments_calendar_slot_id_key`(`calendar_slot_id`),
    INDEX `appointments_provider_user_id_idx`(`provider_user_id`),
    INDEX `appointments_client_user_id_idx`(`client_user_id`),
    INDEX `appointments_project_id_idx`(`project_id`),
    INDEX `appointments_status_idx`(`status`),
    INDEX `appointments_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `type` VARCHAR(60) NOT NULL,
    `title` VARCHAR(190) NOT NULL,
    `body` TEXT NOT NULL,
    `action_url` VARCHAR(255) NULL,
    `payload_json` JSON NULL,
    `status` ENUM('UNREAD', 'READ', 'ARCHIVED') NOT NULL DEFAULT 'UNREAD',
    `read_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `notifications_user_id_idx`(`user_id`),
    INDEX `notifications_status_idx`(`status`),
    INDEX `notifications_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `conversations` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `participant_one_id` BIGINT UNSIGNED NOT NULL,
    `participant_two_id` BIGINT UNSIGNED NOT NULL,
    `created_by_id` BIGINT UNSIGNED NULL,
    `subject` VARCHAR(190) NULL,
    `status` ENUM('ACTIVE', 'ARCHIVED', 'BLOCKED') NOT NULL DEFAULT 'ACTIVE',
    `last_message_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `conversations_participant_one_id_idx`(`participant_one_id`),
    INDEX `conversations_participant_two_id_idx`(`participant_two_id`),
    INDEX `conversations_created_by_id_idx`(`created_by_id`),
    INDEX `conversations_status_idx`(`status`),
    INDEX `conversations_last_message_at_idx`(`last_message_at`),
    INDEX `conversations_created_at_idx`(`created_at`),
    UNIQUE INDEX `conversations_participant_one_id_participant_two_id_key`(`participant_one_id`, `participant_two_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `messages` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `conversation_id` BIGINT UNSIGNED NOT NULL,
    `sender_id` BIGINT UNSIGNED NOT NULL,
    `recipient_id` BIGINT UNSIGNED NOT NULL,
    `body` TEXT NOT NULL,
    `status` ENUM('SENT', 'DELIVERED', 'READ', 'DELETED') NOT NULL DEFAULT 'SENT',
    `read_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `messages_conversation_id_idx`(`conversation_id`),
    INDEX `messages_sender_id_idx`(`sender_id`),
    INDEX `messages_recipient_id_idx`(`recipient_id`),
    INDEX `messages_status_idx`(`status`),
    INDEX `messages_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cost_benchmarks` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `province` VARCHAR(120) NOT NULL,
    `district` VARCHAR(120) NOT NULL DEFAULT '',
    `building_type` VARCHAR(60) NOT NULL,
    `min_cost_per_m2` DECIMAL(16, 2) NOT NULL,
    `max_cost_per_m2` DECIMAL(16, 2) NOT NULL,
    `currency` VARCHAR(20) NOT NULL DEFAULT 'RWF',
    `notes` VARCHAR(255) NULL,
    `updated_by_id` BIGINT UNSIGNED NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `cost_benchmarks_province_idx`(`province`),
    INDEX `cost_benchmarks_updated_by_id_idx`(`updated_by_id`),
    INDEX `cost_benchmarks_created_at_idx`(`created_at`),
    UNIQUE INDEX `cost_benchmarks_province_district_building_type_key`(`province`, `district`, `building_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_region_id_fkey` FOREIGN KEY (`region_id`) REFERENCES `regions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_profiles` ADD CONSTRAINT `user_profiles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_sessions` ADD CONSTRAINT `user_sessions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `region_multipliers` ADD CONSTRAINT `region_multipliers_region_id_fkey` FOREIGN KEY (`region_id`) REFERENCES `regions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `listings` ADD CONSTRAINT `listings_region_id_fkey` FOREIGN KEY (`region_id`) REFERENCES `regions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `listings` ADD CONSTRAINT `listings_owner_user_id_fkey` FOREIGN KEY (`owner_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `listing_images` ADD CONSTRAINT `listing_images_listing_id_fkey` FOREIGN KEY (`listing_id`) REFERENCES `listings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lead_requests` ADD CONSTRAINT `lead_requests_listing_id_fkey` FOREIGN KEY (`listing_id`) REFERENCES `listings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lead_requests` ADD CONSTRAINT `lead_requests_requester_user_id_fkey` FOREIGN KEY (`requester_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `plans` ADD CONSTRAINT `plans_created_by_user_id_fkey` FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `plan_assets` ADD CONSTRAINT `plan_assets_plan_id_fkey` FOREIGN KEY (`plan_id`) REFERENCES `plans`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `plan_requests` ADD CONSTRAINT `plan_requests_plan_id_fkey` FOREIGN KEY (`plan_id`) REFERENCES `plans`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `plan_requests` ADD CONSTRAINT `plan_requests_requester_user_id_fkey` FOREIGN KEY (`requester_user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `service_providers` ADD CONSTRAINT `service_providers_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `service_providers` ADD CONSTRAINT `service_providers_region_id_fkey` FOREIGN KEY (`region_id`) REFERENCES `regions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `provider_reviews` ADD CONSTRAINT `provider_reviews_provider_id_fkey` FOREIGN KEY (`provider_id`) REFERENCES `service_providers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `provider_reviews` ADD CONSTRAINT `provider_reviews_reviewer_user_id_fkey` FOREIGN KEY (`reviewer_user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `projects` ADD CONSTRAINT `projects_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `projects` ADD CONSTRAINT `projects_region_id_fkey` FOREIGN KEY (`region_id`) REFERENCES `regions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_members` ADD CONSTRAINT `project_members_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_members` ADD CONSTRAINT `project_members_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `estimate_summaries` ADD CONSTRAINT `estimate_summaries_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `estimate_summaries` ADD CONSTRAINT `estimate_summaries_plan_id_fkey` FOREIGN KEY (`plan_id`) REFERENCES `plans`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_boq_items` ADD CONSTRAINT `project_boq_items_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_boq_items` ADD CONSTRAINT `project_boq_items_catalog_item_id_fkey` FOREIGN KEY (`catalog_item_id`) REFERENCES `cost_catalog_items`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_documents` ADD CONSTRAINT `project_documents_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_documents` ADD CONSTRAINT `project_documents_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_documents` ADD CONSTRAINT `project_documents_reviewed_by_user_id_fkey` FOREIGN KEY (`reviewed_by_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_progress_logs` ADD CONSTRAINT `project_progress_logs_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `permit_requirements` ADD CONSTRAINT `permit_requirements_region_id_fkey` FOREIGN KEY (`region_id`) REFERENCES `regions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_roi_reports` ADD CONSTRAINT `project_roi_reports_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `emission_factors` ADD CONSTRAINT `emission_factors_catalog_item_id_fkey` FOREIGN KEY (`catalog_item_id`) REFERENCES `cost_catalog_items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_carbon_summaries` ADD CONSTRAINT `project_carbon_summaries_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ai_conversations` ADD CONSTRAINT `ai_conversations_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ai_messages` ADD CONSTRAINT `ai_messages_conversation_id_fkey` FOREIGN KEY (`conversation_id`) REFERENCES `ai_conversations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `uploads` ADD CONSTRAINT `uploads_uploaded_by_id_fkey` FOREIGN KEY (`uploaded_by_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_permission_id_fkey` FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment_webhook_events` ADD CONSTRAINT `payment_webhook_events_transaction_id_fkey` FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `calendar_slots` ADD CONSTRAINT `calendar_slots_provider_user_id_fkey` FOREIGN KEY (`provider_user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `appointments` ADD CONSTRAINT `appointments_provider_user_id_fkey` FOREIGN KEY (`provider_user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `appointments` ADD CONSTRAINT `appointments_client_user_id_fkey` FOREIGN KEY (`client_user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `appointments` ADD CONSTRAINT `appointments_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `appointments` ADD CONSTRAINT `appointments_calendar_slot_id_fkey` FOREIGN KEY (`calendar_slot_id`) REFERENCES `calendar_slots`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `conversations` ADD CONSTRAINT `conversations_participant_one_id_fkey` FOREIGN KEY (`participant_one_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `conversations` ADD CONSTRAINT `conversations_participant_two_id_fkey` FOREIGN KEY (`participant_two_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `conversations` ADD CONSTRAINT `conversations_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_conversation_id_fkey` FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_sender_id_fkey` FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_recipient_id_fkey` FOREIGN KEY (`recipient_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cost_benchmarks` ADD CONSTRAINT `cost_benchmarks_updated_by_id_fkey` FOREIGN KEY (`updated_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
