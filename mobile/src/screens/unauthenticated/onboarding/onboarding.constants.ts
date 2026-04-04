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
    title: "Find surplus deals near you",
    description:
      "Discover delicious food from local restaurants and cafes at a fraction of the price.",
    icon: require("@assets/images/map.png"),
    decoration: require("@assets/images/Container.png"),
  },
  {
    id: "surprise",
    title: "Surprise bags with great value",
    description:
      "Get mystery food boxes with up to 70% discount. Fresh, delicious, and sustainable.",
    icon: require("@assets/images/shopping-bag.png"),
    decoration: require("@assets/images/sparkles.png"),
  },
  {
    id: "booking",
    title: "Book & pick up easily",
    description:
      "Reserve your surprise bag and pick it up at your convenience with our simple QR system.",
    icon: require("@assets/images/scan-line.png"), // these aren't actually used by the new illustrations
    decoration: require("@assets/images/qr-code.png"),
  },
  {
    id: "impact",
    title: "Save money, save the planet",
    description:
      "Track your positive impact on the environment and your wallet with every order.",
    icon: require("@assets/images/map.png"), // generic fallback, not used by new illustrations
    decoration: require("@assets/images/Container.png"),
  },
] as const;

export const TOTAL_STEPS = ONBOARDING_SLIDES.length;
export const LAST_STEP_INDEX = TOTAL_STEPS - 1;
