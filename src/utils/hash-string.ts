import {pbkdf2Sync} from "crypto";

export const hashString = (data: string, salt: string) => {
  return pbkdf2Sync(data, salt, 1000, 64, `sha512`).toString(`hex`);
}