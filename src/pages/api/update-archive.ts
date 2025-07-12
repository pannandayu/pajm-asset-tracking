import { query } from "@/util";
// pages/api/component/archive/append.ts
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { id, archive, type } = req.body;

  if (!id || !archive || !type) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    if (type === "component") {
      await query("UPDATE asset.component SET archive = $1 WHERE id = $2", [
        JSON.stringify(archive),
        id,
      ]);
    } else {
      await query("UPDATE asset.complementary SET archive = $1 WHERE id = $2", [
        JSON.stringify(archive),
        id,
      ]);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error appending to component archive:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
