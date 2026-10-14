export interface LoginPayload {
  identifier: string; // Email or phone
  password: string;
  rememberMe?: boolean;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  favoriteDrinkPreferences?: string[];
}

export interface AuthResult {
  success: boolean;
  message?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

/**
 * Stubbed Auth Service (Ready to plug into NestJS Auth endpoints)
 * Follows SRS FR-AUTH-001: Error messages must NOT reveal whether an account exists.
 */
export async function authenticateUser(
  payload: LoginPayload,
): Promise<AuthResult> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 800));

  const id = payload.identifier.toLowerCase().trim();

  // Valid demo accounts or default pass
  if (
    (id === "customer@cafe.com" ||
      id === "admin@cafe.com" ||
      id === "barista@cafe.com" ||
      id.includes("@")) &&
    payload.password.length >= 6
  ) {
    return {
      success: true,
      user: {
        id: `usr-${Math.random().toString(36).substring(7)}`,
        email: id,
        name: id.startsWith("admin") ? "Abebe Admin" : "Selamawit Kebede",
        role: id.startsWith("admin") ? "ADMIN" : "CUSTOMER",
      },
    };
  }

  // Security rule FR-AUTH-001: Generic error message
  return {
    success: false,
    message: "Invalid email/phone or password. Please check your credentials.",
  };
}

export async function registerNewUser(
  payload: RegisterPayload,
): Promise<AuthResult> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    success: true,
    message: "Account created successfully! Welcome to Sable Circle.",
    user: {
      id: `usr-${Math.random().toString(36).substring(7)}`,
      email: payload.email,
      name: payload.fullName,
      role: "CUSTOMER",
    },
  };
}
