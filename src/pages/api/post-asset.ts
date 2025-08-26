import { getClient } from "@/util";
import type { NextApiRequest, NextApiResponse } from "next";

interface Asset {
  id: string;
  name: string;
  brand: string;
  model: string;
  serial_number: string;
  part_number: string;
  category: string;
  sub_category: string;
  department_owner: string;
  purchase_price: number;
  purchase_order_number: string;
  vendor_supplier: string;
  expected_lifespan: number;
  depreciation_method: string;
  current_book_value: number;
  purchase_date: string;
  depreciation_rate: number;
  status: string;
  warranty: string;
  active_date: string;
  primary_user: string;
  notes: string;
}

interface ComplementaryAsset extends Omit<Asset, "current_book_value"> {
  supplier_vendor: string;
}

interface Component
  extends Omit<
    ComplementaryAsset,
    "category" | "sub_category" | "department_owner"
  > {}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const {
    mainAsset,
    complementaryAssets = [],
    components = [],
  }: {
    mainAsset: Asset;
    complementaryAssets: ComplementaryAsset[];
    components: Component[];
  } = req.body;

  let client;
  try {
    client = await getClient();
    if (!client) {
      throw new Error("Database connection failed");
    }

    await client.query("BEGIN");

    // Generate image URL
    const imageUrl = `/${mainAsset.category
      .toLowerCase()
      .replace(/[ /]/g, "_")}/${mainAsset.sub_category
      .toLowerCase()
      .replace(/[ /]/g, "_")}/${mainAsset.id}.jpg`;

    // Insert main asset
    const mainAssetQuery = `
      INSERT INTO asset.data (
        id, name, brand, model, serial_number, part_number,
        category, sub_category, department_owner, purchase_price,
        purchase_order_number, vendor_supplier, expected_lifespan,
        depreciation_method, current_book_value, purchase_date,
        depreciation_rate, status, warranty, active_date,
        image_url, primary_user, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
               $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
               $21, $22, $23)
    `;
    await client.query(mainAssetQuery, [
      mainAsset.id,
      mainAsset.name,
      mainAsset.brand,
      mainAsset.model,
      mainAsset.serial_number,
      mainAsset.part_number,
      mainAsset.category,
      mainAsset.sub_category,
      mainAsset.department_owner,
      mainAsset.purchase_price,
      mainAsset.purchase_order_number,
      mainAsset.vendor_supplier,
      mainAsset.expected_lifespan,
      mainAsset.depreciation_method,
      mainAsset.current_book_value,
      mainAsset.purchase_date,
      mainAsset.depreciation_rate,
      mainAsset.status,
      mainAsset.warranty,
      mainAsset.active_date,
      imageUrl,
      mainAsset.primary_user,
      mainAsset.notes,
    ]);

    // Process complementary assets
    for (const asset of complementaryAssets) {
      await client.query(
        `INSERT INTO asset.complementary (
          id, name, brand, model, category, sub_category,
          department_owner, archive, expected_lifespan,
          depreciation_method, depreciation_rate, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          asset.id,
          asset.name,
          asset.brand,
          asset.model,
          asset.category,
          asset.sub_category,
          asset.department_owner,
          JSON.stringify([
            {
              serial_number: asset.serial_number,
              part_number: asset.part_number,
              purchase_price: asset.purchase_price,
              purchase_order_number: asset.purchase_order_number,
              purchase_date: asset.purchase_date,
              supplier_vendor: asset.supplier_vendor,
              warranty: asset.warranty,
              status: asset.status,
              active_date: asset.active_date,
            },
          ]),
          asset.expected_lifespan,
          asset.depreciation_method,
          asset.depreciation_rate,
          asset.notes,
        ]
      );

      await client.query(
        `INSERT INTO asset.complementary_relation (parent_id, complementary_id)
         VALUES ($1, $2)`,
        [mainAsset.id, asset.id]
      );
    }

    // Process components
    for (const component of components) {
      await client.query(
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
            },
          ]),
          component.expected_lifespan,
          component.notes,
        ]
      );

      await client.query(
        `INSERT INTO asset.component_relation (parent_id, component_id)
         VALUES ($1, $2)`,
        [mainAsset.id, component.id]
      );
    }

    await client.query("COMMIT");
    return res.status(200).json({ message: "Assets created successfully" });
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
