import assert from "node:assert/strict";
import test from "node:test";
import {
  favoriteOfferCopy,
  orderCompletedCopy,
  pickupReminderCopy,
} from "../src/shared/notifications/notification-copy";

test("builds English and Arabic favorite-offer notifications", () => {
  const english = favoriteOfferCopy("en", "Al Olaya Bakery", "Croissant Box", 20);
  const arabic = favoriteOfferCopy("ar", "مخبز العليا", "علبة كرواسون", 20);

  assert.match(english.body, /Al Olaya Bakery/);
  assert.match(arabic.body, /مخبز العليا/);
});

test("uses production and development pickup reminder wording", () => {
  assert.match(pickupReminderCopy("en", "thirtyMinutes", "Store", false).title, /30/);
  assert.match(pickupReminderCopy("en", "thirtyMinutes", "Store", true).title, /2/);
  assert.match(pickupReminderCopy("ar", "fifteenMinutes", "المتجر", false).body, /15/);
});

test("builds an Arabic completed-order notification", () => {
  const copy = orderCompletedCopy("ar", "مخبز العليا");
  assert.match(copy.title, /تم استلام الطلب/);
  assert.match(copy.body, /مخبز العليا/);
});
