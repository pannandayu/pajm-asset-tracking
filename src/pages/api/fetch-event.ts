import { query } from "@/util";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { eventId } = req.body;

  if (!eventId) {
    throw new Error("Event id error");
  }

  let specificQuery;
  const eventCode = eventId.split("-")[1];

  switch (eventCode) {
    case "LOC":
      specificQuery = "SELECT * FROM asset.location_events WHERE event_id = $1";
      break;
    case "RPR":
      specificQuery = "SELECT * FROM asset.repair_events WHERE event_id = $1";
      break;
    case "MTC":
      specificQuery =
        "SELECT * FROM asset.maintenance_events WHERE event_id = $1";
      break;
  }

  if (!specificQuery) {
    throw new Error("Specific query error");
  }

  try {
    const generalEvent = await query(
      "SELECT * FROM asset.events WHERE event_id = $1",
      [eventId]
    );
    const specificEvent = await query(specificQuery, [eventId]);

    console.log(specificEvent);

    let specificData;

    switch (eventCode) {
      case "LOC":
        specificData = { location: { ...specificEvent[0] } };
        break;
      case "RPR":
        specificData = { repair: { ...specificEvent[0] } };
        break;
      case "MTC":
        specificData = { maintenance: { ...specificEvent[0] } };
        break;
    }

    const data = { ...generalEvent[0], ...specificData };
    // console.log(data)

    return res.status(200).json(data);
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
