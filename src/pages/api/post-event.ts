import { query } from "@/util";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { eventData, specificEventData, eventType } = req.body;

  try {
    const eventQuery = `
      INSERT INTO asset.events (
        event_id, asset_id, asset_name, event_type, 
        event_date, recorded_by, description
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;
    await query(eventQuery, [
      eventData.event_id,
      eventData.asset_id,
      eventData.asset_name,
      eventData.event_type,
      eventData.event_date,
      eventData.recorded_by,
      eventData.description,
    ]);

    let specificQuery;
    switch (eventType) {
      case "location":
        specificQuery = `
          INSERT INTO asset.location_events (
            event_id, location, checked_out_by, checked_in_by
          ) VALUES ($1, $2, $3, $4)
        `;
        await query(specificQuery, [
          eventData.event_id,
          specificEventData.location,
          specificEventData.checked_out_by,
          specificEventData.checked_in_by,
        ]);
        break;

      case "maintenance":
        specificQuery = `
          INSERT INTO asset.maintenance_events (
            event_id, maintenance_type, technician, 
            duration_minutes, cost, downtime_minutes, notes
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;
        await query(specificQuery, [
          eventData.event_id,
          specificEventData.maintenance_type,
          specificEventData.technician,
          specificEventData.duration_minutes,
          specificEventData.cost,
          specificEventData.downtime_minutes,
          specificEventData.notes,
        ]);
        break;

      case "repair":
        specificQuery = `
          INSERT INTO asset.repair_events (
            event_id, failure_description, technician, duration_minutes, 
            cost, downtime_minutes, root_cause, corrective_action, notes
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `;
        await query(specificQuery, [
          eventData.event_id,
          specificEventData.failure_description,
          specificEventData.technician,
          specificEventData.duration_minutes,
          specificEventData.cost,
          specificEventData.downtime_minutes,
          specificEventData.root_cause,
          specificEventData.corrective_action,
          specificEventData.notes,
        ]);
        break;
    }

    return res.status(200).json({ message: "OK" });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
