export function detectPlatform() {
  if (typeof window === "undefined") return "unknown";
  const userAgent = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
  const isAndroid = /android/i.test(userAgent);
  if (isIOS) return "ios";
  if (isAndroid) return "android";
  return "desktop";
}
