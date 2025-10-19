import { Request } from "express";
import https from "https";

export interface DeviceInfo {
  ipAddress: string | undefined;
  os: string;
  browser: string;
  deviceType: "Desktop" | "Mobile" | "Tablet" | "Bot" | "Postman" | "Unknown";

  userAgent: string;
  lastActive: Date;
}
function normalizeIp(ip: string): string {
  if (ip.startsWith("::ffff:")) return ip.substring(7);
  return ip;
}
function getClientIp(req: Request): string | undefined {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) return (forwarded as string).split(",")[0];
  return normalizeIp(req.socket?.remoteAddress as string) || "0.0.0.0";
}

export function parseUserAgent(ua: string) {
  const uaLower = ua.toLowerCase();

  // --- OS Detection ---
  let os = "Unknown OS";
  const osRegexes: [RegExp, string][] = [
    [/windows nt 10\.0/, "Windows"],
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
    const match = uaLower.match(regex);
    if (match) {
      os = name;
      break;
    }
  }

  // --- Browser Detection ---
  let browser = "Unknown Browser";
  const browserRegexes: [RegExp, string][] = [
    [/postmanruntime\/(\d+(\.\d+)?)/, "Postman"],
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

  // --- Device Type Detection ---
  let deviceType: DeviceInfo["deviceType"] = "Desktop";
  if (/mobile/.test(uaLower)) deviceType = "Mobile";
  else if (/tablet|ipad/.test(uaLower)) deviceType = "Tablet";
  else if (/postmanruntime/.test(uaLower)) deviceType = "Postman";

  // Bot Detection
  const botRegex =
    /(bot|crawl|spider|slurp|mediapartners|facebookexternalhit|google|bing|yahoo|duckduckbot|baiduspider|yandex)/i;
  if (botRegex.test(uaLower)) deviceType = "Bot";

  return { os, browser, deviceType };
}

export async function trackDevice(req: Request): Promise<DeviceInfo> {
  const userAgent = req.headers["user-agent"] || "Unknown";

  const ipAddress = getClientIp(req);
  const { os, browser, deviceType } = parseUserAgent(userAgent);

  return {
    ipAddress,
    os,
    browser,
    deviceType,

    userAgent: userAgent,
    lastActive: new Date(),
  };
}
