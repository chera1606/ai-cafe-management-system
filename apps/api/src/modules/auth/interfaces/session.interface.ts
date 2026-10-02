export interface UserSessionResponse {
  id: string;
  device: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  isCurrentSession?: boolean;
  createdAt: Date;
  lastActiveAt: Date;
  expiresAt: Date;
}

export interface ClientConnectionInfo {
  device?: string;
  ipAddress?: string;
  userAgent?: string;
}
