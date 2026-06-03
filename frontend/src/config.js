const rawApiUrl =
  process.env.REACT_APP_API_URL ||
  process.env.REACT_APP_API ||
  process.env.REACT_APP_API_BASE_URL ||
  "http://localhost:5000";

const trimmedApiUrl = rawApiUrl.replace(/\/+$/, "");

export const API_ORIGIN = trimmedApiUrl.replace(/\/api$/, "");
export const API_BASE_URL = `${API_ORIGIN}/api`;
export const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN || "";
export const PUBLIC_URL = process.env.PUBLIC_URL || "";

export const publicAsset = (path) => {
  if (!path) return PUBLIC_URL;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${PUBLIC_URL}${normalizedPath}`;
};
