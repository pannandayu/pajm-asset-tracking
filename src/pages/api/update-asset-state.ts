import { query } from "@/util";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { id, status, active_date, primary_user, notes } = req.body;

  if (!id || !status || !active_date) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    await query(
      "UPDATE asset.data SET status = $1, active_date = $2, notes = $3, primary_user = $4 WHERE id = $5",
      [status, active_date, notes, primary_user, id]
    );

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error updating asset's state:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
