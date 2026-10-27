export const TYPE_AUTH = [
  'USERNAME_PASSWORD',
   'EMAIL_PASSWORD',
   'USERNAME_OTP_MFA',
   'EMAIL_OTP_MFA',
   'EMAIL_OTP_2FA',
   'USERNAME_OTP_2FA'
]

export type TypeAuth =  'USERNAME_PASSWORD' | 'EMAIL_PASSWORD' | 'USERNAME_OTP_MFA' | 'EMAIL_OTP_MFA' | 'EMAIL_OTP_2FA' | 'USERNAME_OTP_2FA';
type TokenType = 'SESSION' | 'API'

export interface AuthenticationCreateDto {
  id?: number
  accountId: number;
  typeAuth: TypeAuth;
  passwordHash?: string;
  otpCodeHash?: string;
  otpExpiresAt?: Date;
  secretKeyOTP?: string;
  isVerified?: boolean;
}

export interface Session {
  accountId: number;
  tokenHash: string;
  tokenType: TokenType;
  // is_active: Boolean;
  permissionsSnapshot: string[];
  expiresAt: Date
}