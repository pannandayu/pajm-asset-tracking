import { getClient, query } from "@/util";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { eventData, specificEventData, eventType } = req.body;

  console.log({
    eventData,
    specificEventData,
    eventType,
  });

  let client;
  try {
    client = await getClient();
    if (!client) {
      throw new Error("Database connection failed");
    }

    await client.query("BEGIN");

    // Insert into events table
    const eventQuery = `
      INSERT INTO asset.events (
        event_id, asset_id, asset_name, event_type, 
        event_date, recorded_by, description, event_finish, 
        status, event_start
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING event_id
    `;

    await query(eventQuery, [
      eventData.event_id,
      eventData.asset_id,
      eventData.asset_name,
      eventData.event_type,
      eventData.event_date,
      eventData.recorded_by,
      eventData.description,
      eventData.event_finish,
      eventData.status,
      eventData.event_start,
    ]);

    // Insert into specific event table
    let specificQuery;
    let queryParams;

    switch (eventType) {
      case "location":
        specificQuery = `
          INSERT INTO asset.location_events (
            event_id, location, checked_out_by, checked_in_by
          ) VALUES ($1, $2, $3, $4)
        `;
        queryParams = [
          eventData.event_id,
          specificEventData.location,
          specificEventData.checked_out_by,
          specificEventData.checked_in_by,
        ];
        break;
      case "maintenance":
        specificQuery = `
          INSERT INTO asset.maintenance_events (
            event_id, maintenance_type, technician, 
            duration_minutes, cost, downtime_minutes, 
            notes, materials_used, actions
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `;
        queryParams = [
          eventData.event_id,
          specificEventData.maintenance_type,
          specificEventData.technician,
          specificEventData.duration_minutes,
          specificEventData.cost,
          specificEventData.downtime_minutes,
          specificEventData.notes || "",
          JSON.stringify(specificEventData.materials_used),
          JSON.stringify(specificEventData.actions),
        ];
        break;
      case "repair":
        specificQuery = `
          INSERT INTO asset.repair_events (
            event_id, failure_description, technician, 
            duration_minutes, cost, downtime_minutes, 
            root_cause, corrective_action, notes, materials_used
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `;
        queryParams = [
          eventData.event_id,
          specificEventData.failure_description,
          specificEventData.technician,
          specificEventData.duration_minutes,
          specificEventData.cost,
          specificEventData.downtime_minutes,
          specificEventData.root_cause,
          JSON.stringify(specificEventData.corrective_action),
          specificEventData.notes,
          JSON.stringify(specificEventData.materials_used),
        ];
        break;
      default:
        throw new Error("Invalid event type");
    }

    await query(specificQuery, queryParams);

    await client.query("COMMIT");

    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error("Error saving event:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
