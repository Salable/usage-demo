import {pbkdf2Sync} from "crypto";

export const validateHash = (data: string, salt: string, hash: string) => {
  const passwordHash = pbkdf2Sync(data, salt, 1000, 64, `sha512`).toString(`hex`);
  return hash === passwordHash;
}