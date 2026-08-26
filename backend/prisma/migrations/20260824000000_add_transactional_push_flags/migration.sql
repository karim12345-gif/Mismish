-- Track each transactional push independently so retries and restarts do not
-- create duplicate pickup or completion notifications.
ALTER TABLE "Order"
  ADD COLUMN "pickupOneHourReminderSentAt" TIMESTAMP(3),
  ADD COLUMN "pickupFifteenMinuteReminderSentAt" TIMESTAMP(3),
  ADD COLUMN "completedNotificationSentAt" TIMESTAMP(3);
