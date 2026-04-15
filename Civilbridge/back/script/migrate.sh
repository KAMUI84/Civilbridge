#!/usr/bin/env bash
set -e
mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < back/src/databases/migration/001_init.sql
echo "Migration applied."