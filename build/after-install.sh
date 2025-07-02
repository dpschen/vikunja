#!/usr/bin/env bash
set -euo pipefail

systemctl enable vikunja.service

# Fix the config to contain proper values
NEW_SECRET=$(tr -dc 'A-Za-z0-9' </dev/urandom | head -c 32)
sed -i "s/<jwt-secret>/$NEW_SECRET/g" /etc/vikunja/config.yml
sed -i "s#<rootpath>#/opt/vikunja/#g" /etc/vikunja/config.yml
sed -i 's#[Pp]ath: ".*vikunja\.db"#path: "/opt/vikunja/vikunja.db"#' /etc/vikunja/config.yml
