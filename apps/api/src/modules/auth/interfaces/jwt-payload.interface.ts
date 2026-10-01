export interface JwtPayload {
  sub: string;
  userId: string;
  email: string;
  roles: string[];
  permissions: string[];
}

export interface UserProfileResponse {
  id: string;
  email: string;
  status: string;
  createdAt: Date;
  roles: string[];
  permissions: string[];
  customer?: {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
    status: string;
  } | null;
  employee?: {
    id: string;
    name: string;
    employmentStatus: string;
  } | null;
}
