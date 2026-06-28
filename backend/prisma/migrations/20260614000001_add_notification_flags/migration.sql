-- Add notification tracking flags
ALTER TABLE "SurpriseBox" ADD COLUMN "notifiedFollowersAt" TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN "pickupReminderSentAt" TIMESTAMP(3);
