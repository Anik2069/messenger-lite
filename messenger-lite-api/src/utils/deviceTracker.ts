import { Request } from "express";
import https from "https";

export interface DeviceInfo {
  ip_address: string;
  os: string;
  browser: string;
  device_type: "DESKTOP" | "MOBILE" | "TABLET" | "BOT" | "POSTMAN" | "UNKNOWN";

  user_agent: string;
  lastActive: Date;
}
function normalizeIp(ip: string): string {
  if (ip.startsWith("::ffff:")) return ip.substring(7);
  return ip;
}
function getClientIp(req: Request): string | undefined {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) return (forwarded as string).split(",")[0];
  // return normalizeIp(req.socket?.remoteAddress as string) || "0.0.0.0";
  return (req.socket?.remoteAddress as string) || "0.0.0.0";
}

export function parseUserAgent(ua: string) {
  const uaLower = ua.toLowerCase();

  // --- OS Detection ---
  let os = "UNKNOWN OS";
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

  // --- Device Type Detection ---
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

export async function trackDevice(req: Request): Promise<DeviceInfo> {
  const user_agent = req.headers["user-agent"] || "UNKNOWN";

  const ip_address = getClientIp(req) || "0.0.0.0";
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
