/**
 * Central ad configuration — one place to manage all AdSense IDs.
 *
 * To activate:
 *  1. Get your AdSense publisher ID from https://adsense.google.com/
 *  2. Set VITE_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX in your .env
 *  3. Create ad units in AdSense dashboard, then paste each data-ad-slot value below
 *  4. Set VITE_AD_SLOT_* for each unit in your .env
 */

export const ADSENSE_CLIENT = import.meta.env.VITE_ADSENSE_CLIENT ?? "ca-pub-9903518567368943";

export const AD_SLOTS = {
  LEADERBOARD_TOP:     import.meta.env.VITE_AD_SLOT_LEADERBOARD_TOP     ?? "",
  ARTICLE_IN_CONTENT:  import.meta.env.VITE_AD_SLOT_ARTICLE_IN_CONTENT  ?? "",
  ARTICLE_AFTER_BODY:  import.meta.env.VITE_AD_SLOT_ARTICLE_AFTER_BODY  ?? "",
  SIDEBAR_MPU:         import.meta.env.VITE_AD_SLOT_SIDEBAR_MPU         ?? "",
  HOMEPAGE_MPU_1:      import.meta.env.VITE_AD_SLOT_HOMEPAGE_MPU_1      ?? "",
  HOMEPAGE_MPU_2:      import.meta.env.VITE_AD_SLOT_HOMEPAGE_MPU_2      ?? "",
  FOOTER_LEADERBOARD:  import.meta.env.VITE_AD_SLOT_FOOTER_LEADERBOARD  ?? "",
};
