export const APP_CONFIG = {
  iosAppStoreId: "6752797791",
  iosBundleId: "com.sanpot.tinda-mobile-fe",
  androidPackageName: "com.sanpot.tinda_mobile_fe",
  androidPlayStoreUrl: "https://play.google.com/store/apps/details?id=com.sanpot.tinda_mobile_fe",
  universalLinkScheme: "https://jobtinda.de",
  websiteDomain: "https://jobtinda.de",
  androidSha256Fingerprints: [
    process.env.SHA256_FINGERPRINT_DEBUG,
    process.env.SHA256_FINGERPRINT_RELEASE,
  ],
};
