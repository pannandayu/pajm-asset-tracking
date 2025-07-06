import { NextApiResponse } from "next";
import { NextApiRequest } from "next";
import { removeTokenCookie } from "../../../lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  removeTokenCookie(res);
  return res.status(200).json({ message: "Logged out successfully" });
}
