import { NextResponse } from "next/server";

import { APP_CONFIG } from "../../../../constants/app";

export async function GET() {
  const data = {
    applinks: {
      apps: [],
      details: [
        {
          appID: `${APP_CONFIG.iosTeamId}.${APP_CONFIG.iosBundleId}`,
          paths: ["/shared-profile/*", "/profile/*"],
        },
      ],
    },
  };

  return NextResponse.json(data, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}
