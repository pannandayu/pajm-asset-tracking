import DataRow from "@/components/DataRow";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import "dayjs/locale/id";
import { Event } from "@/types";
dayjs.extend(utc);

const EventDetail = () => {
  const auth = useAuth();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { id: eventId } = router.query;

  const handleBack = () => {
    router.push("/events");
  };

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/fetch-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      });

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      setEvent(result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to fetch event details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth.loading) return;
    if (!auth.user) {
      router.push("/");
      return;
    }

    if (eventId) {
      fetchEvent();
    }
  }, [auth.loading, auth.user, eventId]);

  const renderLocationDetails = () => (
    <div className="space-y-3">
      <DataRow label="Location" data={event?.location?.location || "-"} />
      <DataRow
        label="Checked Out By"
        data={event?.location?.checked_out_by || "-"}
      />
      <DataRow
        label="Checked In By"
        data={event?.location?.checked_in_by || "-"}
      />
    </div>
  );

  const renderMaintenanceDetails = () => (
    <div className="space-y-3">
      <DataRow
        label="Maintenance Type"
        data={event?.maintenance?.maintenance_type.toUpperCase() || "-"}
      />
      <DataRow
        label="Technician"
        data={event?.maintenance?.technician || "-"}
      />
      <DataRow
        label="Duration (minutes)"
        data={event?.maintenance?.duration_minutes || "-"}
      />
      <DataRow
        label="Cost"
        data={`$${event?.maintenance?.cost.toLocaleString() || "0"}`}
      />
      <DataRow
        label="Downtime (minutes)"
        data={event?.maintenance?.downtime_minutes || "-"}
      />
      <div className="pt-2">
        <h3 className="font-bold text-amber-400 mb-1">Notes:</h3>
        <p className="bg-gray-900 border border-amber-400 p-2 rounded">
          {event?.maintenance?.notes || "-"}
        </p>
      </div>
    </div>
  );

  const renderRepairDetails = () => (
    <div className="space-y-3">
      <DataRow label="Failure Type" data={event?.repair?.failure_type || "-"} />
      <DataRow label="Technician" data={event?.repair?.technician || "-"} />
      <DataRow
        label="Duration (minutes)"
        data={event?.repair?.duration_minutes || "-"}
      />
      <DataRow
        label="Cost"
        data={`$${event?.repair?.cost.toLocaleString() || "0"}`}
      />
      <DataRow
        label="Downtime (minutes)"
        data={event?.repair?.downtime_minutes || "-"}
      />
      <div className="pt-2">
        <h3 className="font-bold text-amber-400 mb-1">Root Cause:</h3>
        <p className="bg-gray-900 border border-amber-400 p-2 rounded">
          {event?.repair?.root_cause || "-"}
        </p>
      </div>
      <div className="pt-2">
        <h3 className="font-bold text-amber-400 mb-1">Corrective Action:</h3>
        <p className="bg-gray-900 border border-amber-400 p-2 rounded">
          {event?.repair?.corrective_action || "-"}
        </p>
      </div>
      <div className="pt-2">
        <h3 className="font-bold text-amber-400 mb-1">Notes:</h3>
        <p className="bg-gray-900 border border-amber-400 p-2 rounded">
          {event?.repair?.notes || "-"}
        </p>
      </div>
    </div>
  );

  const renderEventDetails = () => {
    if (!event) return null;

    switch (event.event_type) {
      case "location":
        return renderLocationDetails();
      case "maintenance":
        return renderMaintenanceDetails();
      case "repair":
        return renderRepairDetails();
      default:
        return <p className="text-amber-400">Unknown event type</p>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-amber-300 p-4 font-mono">
      {loading ? (
        <div className="max-w-6xl mx-auto border-2 border-amber-400 bg-gray-800 p-6 shadow-lg shadow-amber-400/20 text-center">
          <p className="text-xl">LOADING EVENT DATA...</p>
        </div>
      ) : error ? (
        <div className="max-w-6xl mx-auto border-2 border-red-500 bg-gray-800 p-6 shadow-lg shadow-red-500/20">
          <p className="text-red-400 font-bold">ERROR:</p>
          <p className="text-red-300">{error}</p>
          <button
            onClick={handleBack}
            className="mt-4 px-4 py-2 bg-amber-700 hover:bg-amber-600 text-black border-2 border-amber-500 font-bold transition-all"
          >
            ← BACK TO EVENTS
          </button>
        </div>
      ) : event ? (
        <div className="max-w-6xl mx-auto border-2 border-amber-400 bg-gray-800 p-6 shadow-lg shadow-amber-400/20">
          <div className="mb-6 border-b-2 border-amber-400 pb-4">
            <h1 className="text-3xl font-bold tracking-wider text-center">
              EVENT DETAILS
            </h1>
            <p className="text-center text-amber-400 mt-2">{event.event_id}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h1 className="text-2xl font-bold mb-4 pb-2 border-b border-amber-400">
                GENERAL INFO
              </h1>
              <DataRow
                label="Event Type"
                data={event.event_type.toUpperCase()}
              />
              <DataRow label="Asset ID" data={event.asset_id} />
              <DataRow label="Asset Name" data={event.asset_name} />
              <DataRow
                label="Event Date"
                data={dayjs
                  .utc(event.event_date)
                  .locale("id")
                  .format("DD MMM YYYY - HH:mm")}
              />
              <DataRow label="Recorded By" data={event.recorded_by} />
              <div className="pt-2 mt-4">
                <h3 className="font-bold text-amber-400 mb-1">Description:</h3>
                <p className="bg-gray-900 border border-amber-400 p-2 rounded">
                  {event.description || "-"}
                </p>
              </div>
            </div>

            <div>
              <h1 className="text-2xl font-bold mb-4 pb-2 border-b border-amber-400">
                {event.event_type.toUpperCase()} DETAILS
              </h1>
              {renderEventDetails()}
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-amber-700 hover:bg-amber-600 text-black border-2 border-amber-500 font-bold transition-all"
            >
              ← BACK
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto border-2 border-amber-400 bg-gray-800 p-6 shadow-lg shadow-amber-400/20 text-center">
          <p className="text-xl">EVENT NOT FOUND</p>
          <button
            onClick={handleBack}
            className="mt-4 px-4 py-2 bg-amber-700 hover:bg-amber-600 text-black border-2 border-amber-500 font-bold transition-all"
          >
            ← BACK TO EVENTS
          </button>
        </div>
      )}
    </div>
  );
};

export default EventDetail;
