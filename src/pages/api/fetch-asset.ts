import { query } from "@/util";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const data = await query("SELECT * FROM asset.data");
    return res.status(200).json(data);
  } catch (error) {
    console.error("Auth check error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
