// src/libs/utility.ts
import path from "path";
import fs from "fs";
import fsp from "fs/promises";
import crypto from "crypto";

// Replace path backslashes with forward slashes
export const filePathSlashReplace = (p: string): string =>
  p.replace(/\\/g, "/");

// Delete a file if it exists
export const deleteFile = (filePath: string): void => {
  if (fs.existsSync(filePath)) {
    fs.unlink(filePath, (err) => {
      if (err) console.error(err);
    });
  }
};

// Copy a file
export const copyFile = (from: string, to: string): void => {
  fs.copyFile(from, to, (err) => {
    if (err) console.error(err);
  });
};

// Move a file
export const moveFile = (from: string, to: string): void => {
  fs.rename(from, to, (err) => {
    if (err) throw err;
    console.log("Successfully moved!");
  });
};

// Ensure a directory exists
export const allocateDirectory = async (folderName: string): Promise<void> => {
  if (!folderName) return;
  try {
    await fsp.readdir(folderName);
  } catch {
    await fsp.mkdir(folderName, { recursive: true });
  }
};

// Calculate difference in days between two dates
export const diffDays = (
  startDate: Date | string,
  endDate: Date | string
): number => {
  const firstDate = new Date(startDate);
  const secondDate = new Date(endDate);
  return Math.round(
    Math.abs(
      (firstDate.getTime() - secondDate.getTime()) / (24 * 60 * 60 * 1000)
    )
  );
};

// Capitalize first letter of string
export const CapitalizeFirstLetter = (str: string): string => {
  if (typeof str !== "string") return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Copy file to a target folder
export const copyFileToFolder = async (
  sourcePath: string,
  targetFolder: string
): Promise<void> => {
  const fileName = path.basename(sourcePath);
  const targetPath = path.join(targetFolder, fileName);
  await allocateDirectory(targetFolder);
  await fsp.copyFile(sourcePath, targetPath);
};

// Generate a unique invoice number
export const unique_invoice_number = (prefix = ""): string =>
  prefix + Date.now().toString() + crypto.randomBytes(5).toString("hex");

// Generate 4-digit OTP
export const generateOTP = (): number =>
  Math.floor(1000 + Math.random() * 9000);

// Generate random 6-digit ID
export const getRandomId = (min = 0, max = 500000): string => {
  const num = Math.floor(Math.random() * (max - min + 1)) + min;
  return num.toString().padStart(6, "0");
};

// Generate formatted invoice number
export const invoiceNumber = (prefix = ""): string => {
  const now = new Date();
  const id = `${prefix}-${now.getFullYear()}${(now.getMonth() + 1)
    .toString()
    .padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}-${now
    .getHours()
    .toString()
    .padStart(2, "0")}${now.getMinutes().toString().padStart(2, "0")}${now
    .getSeconds()
    .toString()
    .padStart(2, "0")}-${unique_invoice_number()}`;
  return id;
};

// Format date to DD-MM-YYYY
export const getOnlyDate = (date: Date | string): string => {
  const d = new Date(date);
  return `${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}`;
};

// Calculate age from birthday
export const _calculateAge = (birthday: Date): number => {
  const ageDifMs = Date.now() - birthday.getTime();
  const ageDate = new Date(ageDifMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};

// Shuffle an array
export const shuffleArray = <T>(array: T[]): T[] => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    // Assert elements are not undefined
    const temp = array[i]!;
    array[i] = array[j]!;
    array[j] = temp;
  }
  return array;
};

// Calculate age considering birthday
export const calculate_age_in_year = (birthday: Date | string): number => {
  const birthDate = new Date(birthday);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  const dayDiff = today.getDate() - birthDate.getDate();
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) age--;
  return age;
};

// Get file path by fieldname from array of files
export const getFilePath = (
  files: { fieldname: string; path: string }[] | undefined,
  key: string
): string | undefined => {
  const file = files?.find((f) => f.fieldname === key);
  return file?.path;
};
