import jwt from "jsonwebtoken";
import { serialize, parse } from "cookie";
import { NextApiResponse, NextApiRequest } from "next";

const JWT_SECRET = process.env.JWT_SECRET!;
const COOKIE_NAME = "auth-token";
const MAX_AGE = 60 * 60 * 24 * 7;

type UserVerification = {
  id: string;
  name: string;
  username: string;
  tagging: string;
};

export function generateToken(data: UserVerification): string {
  return jwt.sign({ ...data }, JWT_SECRET, {
    expiresIn: MAX_AGE,
  });
}

export function verifyToken(token: string): UserVerification | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserVerification;
  } catch (error) {
    return null;
  }
}

export function setTokenCookie(res: NextApiResponse, token: string): void {
  const cookie = serialize(COOKIE_NAME, token, {
    maxAge: MAX_AGE,
    expires: new Date(Date.now() + MAX_AGE * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "strict",
  });

  res.setHeader("Set-Cookie", cookie);
}

export function removeTokenCookie(res: NextApiResponse): void {
  const cookie = serialize(COOKIE_NAME, "", {
    maxAge: -1,
    path: "/",
  });

  res.setHeader("Set-Cookie", cookie);
}

export function getTokenCookie(req: NextApiRequest): string | null {
  const cookies = parse(req.headers.cookie || "");
  return cookies[COOKIE_NAME] || null;
}
