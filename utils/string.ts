export function parseUserProfileFromUrl(base64Encoded: string | null) {
  if (!base64Encoded) return null;
  try {
    const jsonString = decodeURIComponent(escape(atob(base64Encoded)));
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error parsing user profile from URL:", error);
    return null;
  }
}
