import { Request } from "express";

export interface DeviceInfo {
  ip_address: string;
  os: string;
  browser: string;
  device_type: "DESKTOP" | "MOBILE" | "TABLET" | "BOT" | "POSTMAN" | "UNKNOWN";
  user_agent: string;
  lastActive: Date;
}

// Normalize IPv4-mapped IPv6 addresses
function normalizeIp(ip: string): string {
  if (!ip) return "0.0.0.0";
  if (ip.startsWith("::ffff:")) return ip.substring(7);
  return ip;
}

// Check if IP is private (local network)
function isPrivateIp(ip: string): boolean {
  return (
    ip.startsWith("10.") ||
    ip.startsWith("192.168.") ||
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip)
  );
}

// Get client IP from headers or socket
function getClientIp(req: Request): string {
  // function getClientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];

  // If x-forwarded-for exists, take the first IP, else fallback to socket
  const firstForwarded = Array.isArray(forwarded)
    ? forwarded[0]
    : typeof forwarded === "string"
    ? forwarded.split(",")[0]
    : undefined;

  const ipFromForwarded = firstForwarded ? firstForwarded.trim() : undefined;
  const ip = ipFromForwarded || req.socket?.remoteAddress || "0.0.0.0";

  return normalizeIp(ip);
}

// Parse user-agent to detect OS, browser, and device type
export function parseUserAgent(ua: string) {
  const uaLower = ua.toLowerCase();

  // OS Detection
  let os = "UNKNOWN OS";
  const osRegexes: [RegExp, string][] = [
    [/windows nt 10\.0/, "Windows 10"],
    [/windows nt 6\.3/, "Windows 8.1"],
    [/windows nt 6\.2/, "Windows 8"],
    [/windows nt 6\.1/, "Windows 7"],
    [/mac os x (\d+)[._](\d+)/, "MacOS"],
    [/android (\d+)\.?(\d+)?/, "Android"],
    [/iphone os (\d+)[._](\d+)/, "iOS"],
    [/ipad; cpu os (\d+)[._](\d+)/, "iOS"],
    [/linux/, "Linux"],
    [/cros/, "ChromeOS"],
  ];
  for (const [regex, name] of osRegexes) {
    if (regex.test(uaLower)) {
      os = name;
      break;
    }
  }

  // Browser Detection
  let browser = "UNKNOWN Browser";
  const browserRegexes: [RegExp, string][] = [
    [/postmanruntime\/(\d+(\.\d+)?)/, "POSTMAN"],
    [/edg\/(\d+(\.\d+)?)/, "Edge"],
    [/opr\/(\d+(\.\d+)?)/, "Opera"],
    [/chrome\/(\d+(\.\d+)?)/, "Chrome"],
    [/firefox\/(\d+(\.\d+)?)/, "Firefox"],
    [/version\/(\d+(\.\d+)?).*safari/, "Safari"],
    [/msie (\d+(\.\d+)?)/, "Internet Explorer"],
    [/trident\/.*rv:(\d+(\.\d+)?)/, "Internet Explorer"],
  ];
  for (const [regex, name] of browserRegexes) {
    if (regex.test(uaLower)) {
      browser = name;
      break;
    }
  }

  // Device Type Detection
  let device_type: DeviceInfo["device_type"] = "DESKTOP";
  if (/mobile/.test(uaLower)) device_type = "MOBILE";
  else if (/tablet|ipad/.test(uaLower)) device_type = "TABLET";
  else if (/postmanruntime/.test(uaLower)) device_type = "POSTMAN";

  // BOT Detection
  const botRegex =
    /(bot|crawl|spider|slurp|mediapartners|facebookexternalhit|google|bing|yahoo|duckduckbot|baiduspider|yandex)/i;
  if (botRegex.test(uaLower)) device_type = "BOT";

  return { os, browser, device_type };
}

// Track device info
export async function trackDevice(req: Request): Promise<DeviceInfo> {
  const user_agent = req.headers["user-agent"] || "UNKNOWN";
  const ip_address = getClientIp(req);
  const { os, browser, device_type } = parseUserAgent(user_agent);

  return {
    ip_address,
    os,
    browser,
    device_type,
    user_agent,
    lastActive: new Date(),
  };
}
