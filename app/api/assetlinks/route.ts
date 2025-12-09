import { NextResponse } from 'next/server';

import { APP_CONFIG } from '../../../constants/app';

export async function GET() {
  const assetLinks = [
    {
      relation: ['delegate_permission/common.handle_all_urls'],
      target: {
        namespace: 'android_app',
        package_name: APP_CONFIG.androidPackageName,
        sha256_cert_fingerprints: APP_CONFIG.androidSha256Fingerprints,
      },
    },
  ];

  return NextResponse.json(assetLinks, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

