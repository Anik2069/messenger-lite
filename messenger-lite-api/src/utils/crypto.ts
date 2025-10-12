import crypto from "crypto";

const ALGO = "aes-256-gcm";
const rawKey = crypto.randomBytes(32).toString("hex");

const KEY = Buffer.from(rawKey, "hex");

if (KEY.length !== 32) {
  throw new Error("APP_KEY must be 32 bytes (hex string of 64 chars).");
}

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
export function decrypt(data: string): string {
  const b = Buffer.from(data, "base64");
  const iv = b.subarray(0, 12); // 12 bytes IV
  const tag = b.subarray(12, 28); // 16 bytes AuthTag
  const ciphertext = b.subarray(28); // Remaining ciphertext

  const decipher = crypto.createDecipheriv(ALGO, KEY, iv);
  decipher.setAuthTag(tag);

  const plain = Buffer.concat([decipher.update(ciphertext), decipher.final()]);

  return plain.toString("utf8");
}
