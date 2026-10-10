export interface CustomerProfile {
  id: string;
  name: string;
  phone: string | null;
  email: string;
  status: string;
}

export interface AuthUser {
  id: string;
  email: string;
  status: string;
  createdAt: string;
  emailVerifiedAt?: string | null;
  roles: string[];
  permissions: string[];
  customer?: CustomerProfile;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType?: string;
  expiresIn?: string;
}

export interface SessionInfo {
  id: string;
  deviceInfo: string | null;
  ipAddress: string | null;
  lastActiveAt: string;
  createdAt: string;
  isCurrent?: boolean;
}

export interface LoginSuccessResponse {
  requires2fa?: false;
  accessToken: string;
  refreshToken: string;
  sessionId?: string;
  user: AuthUser;
}

export interface Login2FaRequiredResponse {
  requires2fa: true;
  tempToken: string;
  message?: string;
}

export type LoginResponse = LoginSuccessResponse | Login2FaRequiredResponse;

export interface RegisterResponse {
  message: string;
  user: AuthUser;
}

export interface TwoFactorGenerateResponse {
  secret: string;
  qrCodeUrl: string;
  otpauthUrl: string;
}

export interface TwoFactorEnableResponse {
  message: string;
  recoveryCodes: string[];
}

export interface ApiMessageResponse {
  message: string;
}
