const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://jobtinda.de";

export const APP_CONFIG = {
  iosTeamId: "FL8C342Y9U",
  iosAppStoreId: "6752797791",
  iosBundleId: "com.sanpot.tinda-mobile-fe",
  androidPackageName: "com.sanpot.tinda_mobile_fe",
  androidPlayStoreUrl: "https://play.google.com/store/apps/details?id=com.sanpot.tinda_mobile_fe",
  universalLinkScheme: SITE_URL,
  websiteDomain: SITE_URL,
  androidSha256Fingerprints: [
    process.env.SHA256_FINGERPRINT_DEBUG,
    process.env.SHA256_FINGERPRINT_RELEASE,
  ],
};
