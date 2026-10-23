export const ACCESS_COOKIE = "access_token";
export const REFRESH_COOKIE = "refresh_token";
export const USER_COOKIE = "user_email";
export const ALL_AUTH_COOKIES = [ACCESS_COOKIE, REFRESH_COOKIE, USER_COOKIE];

const REFRESH_MAX_AGE = 60 * 60 * 24 * 7; 
const EXPIRY_BUFFER = 30; //secondsss

export type TokenResponse = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresInSeconds: number;
  issuedAt: string;
};

const base = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export function buildAuthCookies(tokens: TokenResponse) {
  return [
    {
      name: ACCESS_COOKIE,
      value: tokens.accessToken,
      options: { ...base, maxAge: Math.max(tokens.expiresInSeconds - EXPIRY_BUFFER, 1) },
    },
    {
      name: REFRESH_COOKIE,
      value: tokens.refreshToken,
      options: { ...base, maxAge: REFRESH_MAX_AGE },
    },
  ];
}

export function userCookie(email: string) {
  return { name: USER_COOKIE, value: email, options: { ...base, maxAge: REFRESH_MAX_AGE } };
}