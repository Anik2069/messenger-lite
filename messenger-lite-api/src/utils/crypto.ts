import crypto from "crypto";

const ALGO = "aes-256-gcm";
// APP_KEY must be 64 hex characters (32 bytes)
const KEY = Buffer.from(process.env.APP_KEY as string, "hex");
if (KEY.length !== 32)
  throw new Error("APP_KEY must be 32 bytes (hex string 64 chars)");

/**
 * Encrypts a UTF-8 string using AES-256-GCM.
 * @param text The plaintext to encrypt.
 * @returns Base64 encoded string containing IV + AuthTag + Ciphertext.
 */
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(12); // 96-bit IV
  const cipher = crypto.createCipheriv(ALGO, KEY, iv);

  const ciphertext = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  // Combine iv + tag + ciphertext → Base64 string
  return Buffer.concat([iv, tag, ciphertext]).toString("base64");
}

/**
 * Decrypts a Base64 string produced by encrypt().
 * @param data The Base64 encoded encrypted data.
 * @returns The original UTF-8 plaintext.
 */
export const decrypt = (data: any) => {
  const raw = Buffer.from(data, "base64");
  const iv = raw.subarray(0, 12);
  const tag = raw.subarray(12, 28);
  const text = raw.subarray(28);
  const decipher = crypto.createDecipheriv(ALGO, KEY, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(text), decipher.final()]);
  return decrypted.toString("utf8");
};
