"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { APP_CONFIG } from "@/constants/app";

function UniversalLinkContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"detecting" | "redirecting" | "failed">("detecting");
  const [os, setOs] = useState<"ios" | "android" | "unknown">("unknown");

  useEffect(() => {
    // Lấy path từ URL (phần sau domain)
    const path = window.location.pathname;
    const query = searchParams.toString();
    const fullPath = query ? `${path}?${query}` : path;

    // Phát hiện OS
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    let detectedOs: "ios" | "android" | "unknown" = "unknown";

    if (/android/i.test(userAgent)) {
      detectedOs = "android";
    } else if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
      detectedOs = "ios";
    }

    setOs(detectedOs);

    // Tạo universal link URL
    const universalLink = `${APP_CONFIG.universalLinkScheme}${fullPath}`;

    // Tạo intent URL cho Android
    const androidIntent = `intent://${fullPath.replace(
      /^\//,
      ""
    )}#Intent;scheme=${APP_CONFIG.universalLinkScheme.replace("https://", "")};package=${
      APP_CONFIG.androidPackageName
    };end`;

    // Tạo iOS custom URL scheme
    const iosScheme = `${APP_CONFIG.universalLinkScheme.replace(
      "https://",
      ""
    )}://${fullPath.replace(/^\//, "")}`;

    if (detectedOs === "android") {
      // Thử mở app Android
      const startTime = Date.now();
      const timeout = 2500; // 2.5 giây timeout

      // Tạo iframe ẩn để thử mở app
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = androidIntent;
      document.body.appendChild(iframe);

      // Kiểm tra nếu user quay lại (app không mở được)
      const handleVisibilityChange = () => {
        const elapsed = Date.now() - startTime;
        if (document.hidden || elapsed > timeout) {
          // App không mở được, redirect đến Play Store
          window.location.href = APP_CONFIG.androidPlayStoreUrl;
        }
      };

      const handleBlur = () => {
        // User đã chuyển sang app, thành công
        setStatus("redirecting");
      };

      window.addEventListener("blur", handleBlur);
      document.addEventListener("visibilitychange", handleVisibilityChange);

      // Timeout fallback
      setTimeout(() => {
        if (Date.now() - startTime < timeout + 100) {
          // Nếu vẫn còn ở đây sau timeout, có thể app chưa cài
          window.location.href = APP_CONFIG.androidPlayStoreUrl;
        }
      }, timeout);

      // Cleanup
      return () => {
        window.removeEventListener("blur", handleBlur);
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        if (iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
      };
    } else if (detectedOs === "ios") {
      // Thử mở app iOS
      const startTime = Date.now();
      const timeout = 2000; // 2 giây timeout

      // Thử mở universal link trước (iOS 9+)
      window.location.href = universalLink;

      // Fallback: thử custom URL scheme
      setTimeout(() => {
        const elapsed = Date.now() - startTime;
        if (elapsed < timeout + 100) {
          // Nếu vẫn còn ở đây, thử custom scheme
          window.location.href = iosScheme;

          // Nếu vẫn không được, redirect đến App Store
          setTimeout(() => {
            window.location.href = `https://apps.apple.com/app/id${APP_CONFIG.iosAppStoreId}`;
          }, 1500);
        }
      }, timeout);
    } else {
      // Desktop hoặc OS không xác định - hiển thị thông báo
      setStatus("failed");
    }
  }, [searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center py-32 px-16 bg-white dark:bg-black">
        {status === "detecting" && (
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-white"></div>
            <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
              Đang mở ứng dụng...
            </h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              {os === "ios" && "Đang mở ứng dụng trên iOS..."}
              {os === "android" && "Đang mở ứng dụng trên Android..."}
              {os === "unknown" && "Đang xử lý..."}
            </p>
          </div>
        )}
        {status === "redirecting" && (
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="rounded-full h-12 w-12 bg-green-500 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
              Đang chuyển đến ứng dụng...
            </h1>
          </div>
        )}
        {status === "failed" && (
          <div className="flex flex-col items-center gap-6 text-center">
            <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
              Không thể mở ứng dụng
            </h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              Vui lòng truy cập từ thiết bị di động để sử dụng tính năng này.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default function UniversalLinkPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-white"></div>
        </div>
      }
    >
      <UniversalLinkContent />
    </Suspense>
  );
}
