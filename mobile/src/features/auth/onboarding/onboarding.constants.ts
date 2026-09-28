import { Slide } from "./types";

const ONBOARDING_IMAGES = {
  welcome: require("@assets/images/Mismish_onBoarding.png"),
  store: require("@assets/images/store.png"),
  gift: require("@assets/images/gift_bag.png"),
  clock: require("@assets/images/clock.png"),
  rewards: require("@assets/images/rewards.png"),
  alarm: require("@assets/images/alarm.png"),
} as const;

export const ONBOARDING_SLIDES: readonly Slide[] = [
  {
    id: "surplus",
    title: "onboarding.cards.nearby_title",
    description: "onboarding.cards.nearby_description",
    icon: require("@assets/images/map.png"),
    decoration: require("@assets/images/Container.png"),
  },
  {
    id: "surprise",
    title: "onboarding.cards.value_title",
    description: "onboarding.cards.value_description",
    icon: require("@assets/images/shopping-bag.png"),
    decoration: require("@assets/images/sparkles.png"),
  },
  {
    id: "booking",
    title: "onboarding.cards.pickup_title",
    description: "onboarding.cards.pickup_description",
    icon: require("@assets/images/scan-line.png"), // these aren't actually used by the new illustrations
    decoration: require("@assets/images/qr-code.png"),
  },
  {
    id: "impact",
    title: "onboarding.cards.impact_title",
    description: "onboarding.cards.impact_description",
    icon: require("@assets/images/map.png"), // generic fallback, not used by new illustrations
    decoration: require("@assets/images/Container.png"),
  },
] as const;

export const TOTAL_STEPS = ONBOARDING_SLIDES.length;
export const LAST_STEP_INDEX = TOTAL_STEPS - 1;
