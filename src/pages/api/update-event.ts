import { getClient, query } from "@/util";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { eventId, editData, eventType } = req.body;

  if (!eventId || !editData || !eventType) {
    return res.status(400).json({
      success: false,
      message: "Missing required parameters",
    });
  }

  let client;
  try {
    client = await getClient();
    if (!client) {
      throw new Error("Database connection failed");
    }

    await client.query("BEGIN");

    await client.query(
      `UPDATE asset.events
      SET 
        event_finish = $1,
        status = $2,
        event_start = $3
      WHERE event_id = $4
      RETURNING *`,
      [editData.event_finish, editData.status, editData.event_start, eventId]
    );

    let updateQuery: string;
    let queryParams: any[];

    switch (eventType) {
      case "location":
        updateQuery = `
          UPDATE asset.location_events
          SET 
            location = $1,
            checked_out_by = $2,
            checked_in_by = $3
          WHERE event_id = $4
          RETURNING *`;
        queryParams = [
          editData.location,
          editData.checked_out_by,
          editData.checked_in_by || null,
          eventId,
        ];
        break;

      case "maintenance":
        updateQuery = `
          UPDATE asset.maintenance_events
          SET
            maintenance_type = $1,
            technician = $2,
            duration_minutes = $3,
            cost = $4,
            downtime_minutes = $5,
            notes = $6,
            materials_used = $7,
            actions = $8
          WHERE event_id = $9
          RETURNING *`;
        queryParams = [
          editData.maintenance_type,
          editData.technician,
          editData.duration_minutes,
          editData.cost,
          editData.downtime_minutes,
          editData.notes || null,
          JSON.stringify(editData.materials_used || []),
          JSON.stringify(editData.actions || []),
          eventId,
        ];
        break;

      case "repair":
        updateQuery = `
          UPDATE asset.repair_events
          SET
            failure_description = $1,
            technician = $2,
            duration_minutes = $3,
            cost = $4,
            downtime_minutes = $5,
            root_cause = $6,
            corrective_action = $7,
            notes = $8,
            materials_used = $9
          WHERE event_id = $10
          RETURNING *`;
        queryParams = [
          editData.failure_description,
          editData.technician,
          editData.duration_minutes,
          editData.cost,
          editData.downtime_minutes,
          editData.root_cause,
          JSON.stringify(editData.corrective_action || []),
          editData.notes || null,
          JSON.stringify(editData.materials_used || []),
          eventId,
        ];
        break;

      default:
        await client.query("ROLLBACK");
        return res.status(400).json({
          success: false,
          message: "Invalid event type",
        });
    }

    const result = await client.query(updateQuery, queryParams);

    if (result.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    await client.query("COMMIT");

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating event:", error);
    if (client) {
      await client.query("ROLLBACK").catch(console.error);
    }
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  } finally {
    if (client) {
      try {
        await client.release();
      } catch (e) {
        console.error("Error releasing client:", e);
      }
    }
  }
}
