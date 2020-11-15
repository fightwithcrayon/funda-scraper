#!/bin/bash

echo "Logging started ..." > /var/log/funda-scraper.log

# Add cron schedule
/root/Desktop/update-cron.sh --init

echo "Starting cron ..." >> /var/log/funda-scraper.log

cron

exec /startup.sh
