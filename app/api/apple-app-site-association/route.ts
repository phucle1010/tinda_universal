import { NextResponse } from 'next/server';

import { APP_CONFIG } from '../../../constants/app';


export async function GET() {
  const association = {
    applinks: {
      apps: [],
      details: [
        {
          appID: `${APP_CONFIG.iosTeamId}.${APP_CONFIG.iosBundleId}`,
          paths: ['*'], 
        },
      ],
    },
    webcredentials: {
      apps: [`${APP_CONFIG.iosTeamId}.${APP_CONFIG.iosBundleId}`],
    },
  };

  return NextResponse.json(association, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

