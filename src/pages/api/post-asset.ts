import { query } from "@/util";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { mainAsset, complementaryAssets, components } = req.body;

  try {
    const eventQuery = `
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
    await query(eventQuery, [
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
      mainAsset.image_url,
      mainAsset.primary_user,
      mainAsset.notes,
    ]);

    if (complementaryAssets.length > 0) {
      for (const el of complementaryAssets) {
        await query(
          `
          INSERT INTO asset.complementary (
            id, name, brand, model, category, sub_category,
            department_owner, archive, expected_lifespan,
            depreciation_method, depreciation_rate, notes
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          `,
          [
            el.id, // PRIMARY KEY (must be unique)
            el.name,
            el.brand,
            el.model,
            el.category,
            el.sub_category,
            el.department_owner,
            JSON.stringify([
              {
                // Properly structured JSONB data
                serial_number: el.serial_number,
                part_number: el.part_number,
                purchase_price: el.purchase_price,
                purchase_order_number: el.purchase_order_number,
                purchase_date: el.purchase_date,
                supplier_vendor: el.supplier_vendor,
                warranty: el.warranty,
                status: el.status,
                active_date: el.active_date,
              },
            ]),
            el.expected_lifespan,
            el.depreciation_method,
            el.depreciation_rate,
            el.notes,
          ]
        );

        await query(
          `
          INSERT INTO asset.complementary_relation (
            parent_id, complementary_id
          ) VALUES ($1, $2)
          `,
          [
            mainAsset.id, // PRIMARY KEY (must be unique)
            el.id,
          ]
        );
      }
    }

    if (components.length > 0) {
      for (const el of components) {
        await query(
          `
          INSERT INTO asset.component (
            id, name, brand, model, archive,
            expected_lifespan, notes
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          `,
          [
            el.id, // PRIMARY KEY (must be unique)
            el.name,
            el.brand,
            el.model,
            JSON.stringify([
              {
                // Properly structured JSONB data
                serial_number: el.serial_number,
                part_number: el.part_number,
                purchase_price: el.purchase_price,
                supplier_vendor: el.supplier_vendor,
                purchase_order_number: el.purchase_order_number,
                purchase_date: el.purchase_date,
                warranty: el.warranty,
                status: el.status,
                active_date: el.active_date,
              },
            ]),
            el.expected_lifespan,
            el.notes,
          ]
        );

        await query(
          `
          INSERT INTO asset.component_relation (
            parent_id, component_id
          ) VALUES ($1, $2)
          `,
          [
            mainAsset.id, // PRIMARY KEY (must be unique)
            el.id,
          ]
        );
      }
    }

    return res.status(200).json({ message: "OK" });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
