import { getClient } from "../../util";
import { query } from "@/util";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { assetId, component } = req.body;

  let client;
  try {
    client = await getClient();
    if (!client) {
      throw new Error("Database connection failed");
    }

    await client.query("BEGIN");

    await query(
      `INSERT INTO asset.component (
        id, name, brand, model, archive,
        expected_lifespan, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        component.id,
        component.name,
        component.brand,
        component.model,
        JSON.stringify([
          {
            serial_number: component.serial_number,
            part_number: component.part_number,
            purchase_price: component.purchase_price,
            purchase_order_number: component.purchase_order_number,
            purchase_date: component.purchase_date,
            supplier_vendor: component.supplier_vendor,
            warranty: component.warranty,
            status: component.status,
            active_date: component.active_date,
            notes: component.notes_purchase,
          },
        ]),
        component.expected_lifespan,
        component.notes_component,
      ]
    );

    await client.query(
      `INSERT INTO asset.component_relation (parent_id, component_id)
       VALUES ($1, $2)`,
      [assetId, component.id]
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
