import { NextResponse } from "next/server";

import { APP_CONFIG } from "../../../../constants/app";

export async function GET() {
  const fingerprints = (APP_CONFIG.androidSha256Fingerprints || []).filter(Boolean);

  const data = [
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: APP_CONFIG.androidPackageName,
        sha256_cert_fingerprints: fingerprints,
      },
    },
  ];

  return NextResponse.json(data, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}
