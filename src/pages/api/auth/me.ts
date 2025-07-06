import type { NextApiRequest, NextApiResponse } from "next";
import { getTokenCookie, verifyToken } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const token = getTokenCookie(req);

    if (!token) {
      return res.status(401).json({ user: null });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ user: null });
    }

    return res.status(200).json(decoded);
  } catch (error) {
    console.error("Auth check error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
