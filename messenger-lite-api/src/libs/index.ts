// src/libs/errorLogStream.ts
import fs from "fs";
import path from "path";
import { Writable } from "stream";

const getLogFileName = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}.log`;
};

// Ensure logs folder exists
const logsDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFilePath = path.join(logsDir, getLogFileName());

export const errorLogStream: Writable = fs.createWriteStream(logFilePath, {
  flags: "a",
});
