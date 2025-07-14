import { getClient } from "./../../util";
import { query } from "@/util";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { assetId, complementary } = req.body;

  let client;
  try {
    client = await getClient();
    if (!client) {
      throw new Error("Database connection failed");
    }

    await client.query("BEGIN");

    await query(
      `
    INSERT INTO asset.complementary (
      id, name, brand, model, category, sub_category,
      department_owner, archive, expected_lifespan,
      depreciation_method, depreciation_rate, notes
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    `,
      [
        complementary.id,
        complementary.name,
        complementary.brand,
        complementary.model,
        complementary.category,
        complementary.sub_category,
        complementary.department_owner,
        JSON.stringify([
          {
            serial_number: complementary.serial_number,
            part_number: complementary.part_number,
            purchase_price: complementary.purchase_price,
            purchase_order_number: complementary.purchase_order_number,
            purchase_date: complementary.purchase_date,
            supplier_vendor: complementary.supplier_vendor,
            warranty: complementary.warranty,
            status: complementary.status,
            active_date: complementary.active_date,
          },
        ]),
        complementary.expected_lifespan,
        complementary.depreciation_method,
        complementary.depreciation_rate,
        complementary.notes,
      ]
    );

    await client.query(
      `INSERT INTO asset.complementary_relation (parent_id, complementary_id)
       VALUES ($1, $2)`,
      [assetId, complementary.id]
    );

    await client.query("COMMIT");

    return res.status(200).json({ message: "OK" });
  } catch (error) {
    if (client) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("Rollback failed:", rollbackError);
      }
    }

    console.error("Transaction error:", error);
    return res.status(500).json({
      message: "Failed to create assets",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  } finally {
    if (client) {
      try {
        client.release();
      } catch (releaseError) {
        console.error("Client release failed:", releaseError);
      }
    }
  }
}
