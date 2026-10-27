import { v4 as uuidv4 } from "uuid";
import argon2 from "argon2";
import CryptoJS from "crypto-js";
import * as OTPAuth from "otpauth";
import jwt from "jsonwebtoken";
import type { StringValue } from "ms";
import { readFileSync } from "node:fs";

export const generateUUid = () => {
  return uuidv4();
};

export const generateHash = async (data: string): Promise<string> => {
  return await argon2.hash(data);
};

export const verifyHash = async (
  hash: string,
  data: string,
): Promise<boolean> => {
  return await argon2.verify(hash, data);
};

export const encryto = async (
  data: string,
  secretKey: string,
): Promise<string> => {
  return CryptoJS.AES.encrypt(data, secretKey).toString();
};

export const decrypt = async (dataCrypto: string, secretKey: string) => {
  return CryptoJS.AES.decrypt(dataCrypto, secretKey).toString(
    CryptoJS.enc.Utf8,
  );
};

export const generateAccessToken = async (
  payload: Object,
  expiresIn: number | StringValue,
) => {
  const privateKey = readFileSync(new URL("../../../keys_security/private_key.pem", import.meta.url));
  return jwt.sign({ payload }, privateKey, {
    algorithm: "RS256",
    expiresIn,
  });
};

export const verifyAccessToken = async (token: string) => {
  const cert = readFileSync(new URL("../../../keys_security/public_certificate.pem", import.meta.url));
  return jwt.verify(token, cert);
};

export const validateCodeOTP = async (
  token: string,
  secret: OTPAuth.Secret | string = new OTPAuth.Secret(),
  issuer: string = "SUPERADMIN",
  label: string = "SUPERADMIN",
  digits: number = 6,
) => {
  const totp = new OTPAuth.TOTP({
    issuer,
    label,
    // Algorithm used for the HMAC function, possible values are:
    //   "SHA1", "SHA224", "SHA256", "SHA384", "SHA512",
    //   "SHA3-224", "SHA3-256", "SHA3-384" and "SHA3-512".
    algorithm: "SHA512",
    // Length of the generated tokens.
    digits,
    // Interval of time for which a token is valid, in seconds.
    period: 30,
    // Arbitrary key encoded in base32 or `OTPAuth.Secret` instance
    // (if omitted, a cryptographically secure random secret is generated).
    // secret,
    secret,
    //   or: `OTPAuth.Secret.fromBase32("US3WHSG7X5KAPV27VANWKQHF3SH3HULL")`
    //   or: `new OTPAuth.Secret()`
    // Custom HMAC function (required for bare build, optional otherwise).
    // hmac: (algorithm, key, message) => Uint8Array,
  });
  return totp.validate({ token, window: 1 });
};

export const totp = async (
  issuer: string = "SUPERADMIN",
  label: string = "SUPERADMIN",
  digits: number = 6,
  secret: OTPAuth.Secret | string = new OTPAuth.Secret(),
) => {
  const totp = new OTPAuth.TOTP({
    issuer,
    label,
    // Algorithm used for the HMAC function, possible values are:
    //   "SHA1", "SHA224", "SHA256", "SHA384", "SHA512",
    //   "SHA3-224", "SHA3-256", "SHA3-384" and "SHA3-512".
    algorithm: "SHA512",
    // Length of the generated tokens.
    digits,
    // Interval of time for which a token is valid, in seconds.
    period: 30,
    // Arbitrary key encoded in base32 or `OTPAuth.Secret` instance
    // (if omitted, a cryptographically secure random secret is generated).
    // secret,
    secret,
    //   or: `OTPAuth.Secret.fromBase32("US3WHSG7X5KAPV27VANWKQHF3SH3HULL")`
    //   or: `new OTPAuth.Secret()`
    // Custom HMAC function (required for bare build, optional otherwise).
    // hmac: (algorithm, key, message) => Uint8Array,
  });

  return {
    token: totp.generate(),
    validate: (token: string) => totp.validate({ token, window: 1 }),
    uri: totp.toString(),
  };
};
