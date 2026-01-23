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
    id: "welcome",
    title: "Welcome to MishMish!",
    image: ONBOARDING_IMAGES.welcome,
  },
  {
    id: "nearbyStores",
    title: "Find stores right next to you!",
    image: ONBOARDING_IMAGES.store,
  },
  {
    id: "surprise",
    title: "Get ready for a surprise",
    image: ONBOARDING_IMAGES.gift,
  },
  {
    id: "booking",
    title: "Book and be on time",
    image: ONBOARDING_IMAGES.clock,
  },
  {
    id: "collect",
    title: "Collect and enjoy",
    image: ONBOARDING_IMAGES.rewards,
  },
  {
    id: "reminder",
    title: "Don't miss out",
    image: ONBOARDING_IMAGES.alarm,
  },
] as const;

export const TOTAL_STEPS = ONBOARDING_SLIDES.length;
export const LAST_STEP_INDEX = TOTAL_STEPS - 1;
