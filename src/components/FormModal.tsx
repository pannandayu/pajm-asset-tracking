import { useAuth } from "@/context/AuthContext";
import dayjs from "dayjs";
import { ChangeEvent, FormEvent, useState } from "react";

const generateCode = (): string => {
  const letters = Array.from({ length: 3 }, () =>
    String.fromCharCode(65 + Math.floor(Math.random() * 26))
  ).join("");
  const digits = Array.from({ length: 3 }, () =>
    Math.floor(Math.random() * 10)
  ).join("");
  return `${letters}${digits}`;
};

const EventModal = ({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: () => void;
}) => {
  const [eventType, setEventType] = useState("location");
  const [formData, setFormData] = useState({
    asset_id: "",
    asset_name: "",
    event_date: new Date().toISOString().slice(0, 16),
    recorded_by: "",
    description: "",
    location: "",
    checked_out_by: "",
    checked_in_by: "",
    maintenance_type: "preventive",
    technician: "",
    duration_minutes: 0,
    cost: 0,
    downtime_minutes: 0,
    maintenance_notes: "",
    failure_description: "",
    repair_technician: "",
    repair_duration: 0,
    repair_cost: 0,
    repair_downtime: 0,
    root_cause: "",
    corrective_action: "",
    repair_notes: "",
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const auth = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    let typeCode;
    let eventPrefix;
    switch (eventType) {
      case "location":
        typeCode = "LOC";
        eventPrefix = "EVT";
        break;
      case "maintenance":
        typeCode = "MTC";
        eventPrefix = "WO";
        break;
      case "repair":
        typeCode = "RPR";
        eventPrefix = "WO";
        break;
    }

    const dateNow = dayjs().format("DDMMYY");

    const event_id = `${eventPrefix}-${typeCode}-${dateNow}-${generateCode()}`;

    const eventData = {
      event_id,
      asset_id: formData.asset_id,
      asset_name: formData.asset_name,
      event_type: eventType,
      event_date: formData.event_date,
      recorded_by: formData.recorded_by,
      description: formData.description,
    };

    let specificEventData = {};
    switch (eventType) {
      case "location":
        specificEventData = {
          event_id,
          location: formData.location,
          checked_out_by: formData.checked_out_by,
          checked_in_by: formData.checked_in_by,
        };
        break;
      case "maintenance":
        specificEventData = {
          event_id,
          maintenance_type: formData.maintenance_type,
          technician: formData.technician,
          duration_minutes: Number(formData.duration_minutes),
          cost: Number(formData.cost),
          downtime_minutes: Number(formData.downtime_minutes),
          notes: formData.maintenance_notes,
        };
        break;
      case "repair":
        specificEventData = {
          event_id,
          failure_description: formData.failure_description,
          technician: formData.repair_technician,
          duration_minutes: Number(formData.repair_duration),
          cost: Number(formData.repair_cost),
          downtime_minutes: Number(formData.repair_downtime),
          root_cause: formData.root_cause,
          corrective_action: formData.corrective_action,
          notes: formData.repair_notes,
        };
        break;
    }

    try {
      const response = await fetch("/api/post-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventData, specificEventData, eventType }),
      });

      if (response.ok) {
        onSubmit();
        onClose();
      } else {
        console.error("Failed to submit event");
      }
    } catch (error) {
      console.error("Error submitting event:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg border-2 border-amber-400 font-mono text-amber-300 w-full max-w-2xl max-h-[90vh] flex flex-col shadow-lg shadow-amber-400/20">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b border-amber-400 sticky top-0 bg-gray-800 z-10">
          <h2 className="text-xl font-bold tracking-wider">RECORD NEW EVENT</h2>
          <button
            onClick={onClose}
            className="text-amber-400 hover:text-amber-200 text-xl"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-4 flex-1">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Common Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1 font-bold">
                  ASSET ID:
                </label>
                <input
                  type="text"
                  name="asset_id"
                  value={formData.asset_id.toUpperCase()}
                  onChange={handleChange}
                  className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1 font-bold">
                  ASSET NAME:
                </label>
                <input
                  type="text"
                  name="asset_name"
                  value={formData.asset_name}
                  onChange={handleChange}
                  placeholder="TITLE CASE"
                  className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1 font-bold">
                  EVENT DATE:
                </label>
                <input
                  type="datetime-local"
                  name="event_date"
                  value={formData.event_date}
                  onChange={handleChange}
                  className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1 font-bold">
                  RECORDED BY:
                </label>
                <input
                  type="text"
                  name="recorded_by"
                  value={formData.recorded_by}
                  onChange={handleChange}
                  className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-400"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1 font-bold">
                EVENT TYPE:
              </label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-400"
              >
                <option value="location">LOCATION</option>
                <option value="maintenance">MAINTENANCE</option>
                <option value="repair">REPAIR</option>
              </select>
            </div>

            <div>
              <label className="block text-sm mb-1 font-bold">
                BRIEF DESCRIPTION:
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-400"
                rows={2}
                required
              />
            </div>

            {/* Location Fields */}
            {eventType === "location" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1 font-bold">
                    LOCATION:
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1 font-bold">
                    CHECKED OUT BY:
                  </label>
                  <input
                    type="text"
                    name="checked_out_by"
                    value={formData.checked_out_by}
                    onChange={handleChange}
                    className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-400"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm mb-1 font-bold">
                    CHECKED IN BY (OPTIONAL):
                  </label>
                  <input
                    type="text"
                    name="checked_in_by"
                    value={formData.checked_in_by}
                    onChange={handleChange}
                    className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                </div>
              </div>
            )}

            {/* Maintenance Fields */}
            {eventType === "maintenance" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1 font-bold">
                    MAINTENANCE TYPE:
                  </label>
                  <select
                    name="maintenance_type"
                    value={formData.maintenance_type}
                    onChange={handleChange}
                    className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-400"
                  >
                    <option value="preventive">PREVENTIVE</option>
                    <option value="predictive">PREDICTIVE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1 font-bold">
                    TECHNICIAN:
                  </label>
                  <input
                    type="text"
                    name="technician"
                    value={formData.technician}
                    onChange={handleChange}
                    className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1 font-bold">
                    DURATION (MINUTES):
                  </label>
                  <input
                    type="number"
                    name="duration_minutes"
                    value={formData.duration_minutes}
                    onChange={handleChange}
                    className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-400"
                    required
                    min="0"
                  />
                </div>
                {auth.user && auth.user.tagging === "0" && (
                  <div>
                    <label className="block text-sm mb-1 font-bold">
                      COST (Rp):
                    </label>
                    <input
                      type="number"
                      name="cost"
                      value={formData.cost}
                      onChange={handleChange}
                      className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-400"
                      required
                      min="0"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm mb-1 font-bold">
                    DOWNTIME (MINUTES):
                  </label>
                  <input
                    type="number"
                    name="downtime_minutes"
                    value={formData.downtime_minutes}
                    onChange={handleChange}
                    className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-400"
                    required
                    min="0"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm mb-1 font-bold">NOTES:</label>
                  <textarea
                    name="maintenance_notes"
                    value={formData.maintenance_notes}
                    onChange={handleChange}
                    className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-400"
                    rows={2}
                  />
                </div>
              </div>
            )}

            {/* Repair Fields */}
            {eventType === "repair" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1 font-bold">
                    FAILURE DESCRIPTION:
                  </label>
                  <input
                    type="text"
                    name="failure_description"
                    value={formData.failure_description}
                    onChange={handleChange}
                    className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1 font-bold">
                    TECHNICIAN:
                  </label>
                  <input
                    type="text"
                    name="repair_technician"
                    value={formData.repair_technician}
                    onChange={handleChange}
                    className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1 font-bold">
                    DURATION (MINUTES):
                  </label>
                  <input
                    type="number"
                    name="repair_duration"
                    value={formData.repair_duration}
                    onChange={handleChange}
                    className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-400"
                    required
                    min="0"
                  />
                </div>
                {auth.user && auth.user.tagging && (
                  <div>
                    <label className="block text-sm mb-1 font-bold">
                      COST (Rp):
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="repair_cost"
                      value={formData.repair_cost}
                      onChange={handleChange}
                      className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-400"
                      required
                      min="0"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm mb-1 font-bold">
                    DOWNTIME (MINUTES):
                  </label>
                  <input
                    type="number"
                    name="repair_downtime"
                    value={formData.repair_downtime}
                    onChange={handleChange}
                    className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-400"
                    required
                    min="0"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm mb-1 font-bold">
                    ROOT CAUSE:
                  </label>
                  <textarea
                    name="root_cause"
                    value={formData.root_cause}
                    onChange={handleChange}
                    className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-400"
                    rows={2}
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm mb-1 font-bold">
                    CORRECTIVE ACTION:
                  </label>
                  <textarea
                    name="corrective_action"
                    value={formData.corrective_action}
                    onChange={handleChange}
                    className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-400"
                    rows={2}
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm mb-1 font-bold">NOTES:</label>
                  <textarea
                    name="repair_notes"
                    value={formData.repair_notes}
                    onChange={handleChange}
                    className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-400"
                    rows={2}
                  />
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Sticky Footer */}
        <div className="p-4 border-t border-amber-400 sticky bottom-0 bg-gray-800">
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border-2 border-amber-400 rounded hover:bg-gray-700 text-amber-300 font-bold"
            >
              CANCEL
            </button>
            <button
              type="submit"
              form="event-form"
              className="px-4 py-2 bg-amber-600 text-black border-2 border-amber-500 rounded hover:bg-amber-500 font-bold"
              onClick={handleSubmit}
            >
              SAVE EVENT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
