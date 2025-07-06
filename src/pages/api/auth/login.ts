import { generateToken, setTokenCookie } from "@/lib/auth";
import { query } from "@/util";

import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { username, password } = req.body;

    const data = await query(
      "SELECT id, name, username, password, tagging FROM asset.user WHERE username = $1 AND password = $2",
      [username, password]
    );

    if (data.length === 0) {
      return res.status(401).json({ message: "Username atau password salah" });
    }

    const { id, username: uname, name, tagging } = data[0];

    const token = generateToken({
      id,
      name,
      username: uname,
      tagging,
    });
    setTokenCookie(res, token);

    return res.status(200).json({
      user: { id, username: uname, name, tagging },
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
