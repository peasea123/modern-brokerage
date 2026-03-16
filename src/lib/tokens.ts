import { v4 as uuidv4 } from "uuid";
import { CONFIG } from "./config";

export function generateDownloadToken(): string {
  return uuidv4();
}

export function getTokenExpiryDate(): string {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + CONFIG.downloadTokenExpiryHours);
  return expiry.toISOString();
}

export function isTokenExpired(expiresAt: string): boolean {
  return new Date(expiresAt) < new Date();
}
