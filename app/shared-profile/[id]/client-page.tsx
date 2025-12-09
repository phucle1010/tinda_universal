"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { APP_CONFIG } from "@/constants/app";
import { APP_STORE_URL, GOOGLE_PLAY_URL } from "@/constants/mobile";
import { detectPlatform } from "@/utils/device";
import { parseUserProfileFromUrl } from "@/utils/string";

interface ClientPageProps {
  profileId: string;
}

export default function ClientPage({ profileId }: ClientPageProps) {
  const searchParams = useSearchParams();
  const [platform, setPlatform] = useState<"ios" | "android" | "desktop" | "unknown">("unknown");
  const [redirecting, setRedirecting] = useState(true);

  useEffect(() => {
    const detectedPlatform = detectPlatform();
    setPlatform(detectedPlatform);

    const profileParam = searchParams.get("profile");
    parseUserProfileFromUrl(profileParam);

    const path = window.location.pathname;
    const query = searchParams.toString();
    const fullPath = query ? `${path}?${query}` : path;
    const universalUrl = `${APP_CONFIG.universalLinkScheme}${fullPath}`;
    const androidIntent = `intent://${fullPath.replace(/^\//, "")}#Intent;scheme=https;package=${
      APP_CONFIG.androidPackageName
    };S.browser_fallback_url=${encodeURIComponent(GOOGLE_PLAY_URL)};end`;

    // Prevent redirect loops when universal link falls back to this same page.
    const lastAttemptKey = "tinda_universal_attempt_ts";
    const lastAttempt = Number(localStorage.getItem(lastAttemptKey) || 0);
    const now = Date.now();
    const attemptedRecently = now - lastAttempt < 5000;

    if (detectedPlatform === "ios") {
      if (attemptedRecently) {
        setRedirecting(false);
        window.location.replace(APP_STORE_URL);
        return;
      }

      localStorage.setItem(lastAttemptKey, `${now}`);

      const storeTimer = setTimeout(() => {
        window.location.href = APP_STORE_URL;
      }, 2200);

      // Safety: if we are still on this page after a bit, show desktop view instead of spinning forever
      const fallbackRenderTimer = setTimeout(() => {
        setRedirecting(false);
      }, 4000);

      const handleBlur = () => {
        clearTimeout(storeTimer);
        clearTimeout(fallbackRenderTimer);
      };
      const handleVisibilityChange = () => {
        if (document.hidden) {
          clearTimeout(storeTimer);
          clearTimeout(fallbackRenderTimer);
        }
      };

      window.addEventListener("blur", handleBlur);
      document.addEventListener("visibilitychange", handleVisibilityChange);

      window.location.href = universalUrl;

      return () => {
        clearTimeout(storeTimer);
        clearTimeout(fallbackRenderTimer);
        window.removeEventListener("blur", handleBlur);
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      };
    } else if (detectedPlatform === "android") {
      const storeTimer = setTimeout(() => {
        window.location.href = GOOGLE_PLAY_URL;
      }, 2200);

      const fallbackRenderTimer = setTimeout(() => {
        setRedirecting(false);
      }, 4000);

      const handleBlur = () => {
        clearTimeout(storeTimer);
        clearTimeout(fallbackRenderTimer);
      };
      const handleVisibilityChange = () => {
        if (document.hidden) {
          clearTimeout(storeTimer);
          clearTimeout(fallbackRenderTimer);
        }
      };

      window.addEventListener("blur", handleBlur);
      document.addEventListener("visibilitychange", handleVisibilityChange);

      window.location.href = androidIntent;

      return () => {
        clearTimeout(storeTimer);
        clearTimeout(fallbackRenderTimer);
        window.removeEventListener("blur", handleBlur);
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      };
    } else {
      setRedirecting(false);
    }
  }, [profileId, searchParams]);

  if (platform === "desktop" || !redirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Job Tinda</h1>
          <p className="text-gray-600 mb-8">
            Please open this link on your mobile device to view the profile.
          </p>
          <div className="flex flex-col gap-4">
            <a
              href={APP_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              Download for iOS
            </a>
            <a
              href={GOOGLE_PLAY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Download for Android
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-4xl font-bold mb-4">Job Tinda</h1>
        <p className="text-xl">Opening Job Tinda app...</p>
        <div className="mt-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
        </div>
      </div>
    </div>
  );
}
