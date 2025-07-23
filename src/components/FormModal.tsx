import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { MaterialItem, Event } from "@/types";

const UOM = [
  "Pcs",
  "Unit",
  "Roll",
  "Set",
  "Mtr",
  "Lusin",
  "Kg",
  "Klg",
  "Btl",
  "Box",
  "Pak",
  "Ltr",
];

const generateCode = (): string => {
  const letters = Array.from({ length: 3 }, () =>
    String.fromCharCode(65 + Math.floor(Math.random() * 26))
  ).join("");
  const digits = Array.from({ length: 3 }, () =>
    Math.floor(Math.random() * 10)
  ).join("");
  return `${letters}${digits}`;
};

const calculateTotalCost = (materials: MaterialItem[]): number => {
  return materials.reduce(
    (total, item) => total + item.quantity * item.price,
    0
  );
};

interface EventModalProps {
  onClose: () => void;
  onSubmit: () => void;
}

interface MaintenanceFormData {
  maintenance_type: string;
  technician: string;
  duration_minutes: number;
  cost: number;
  materials_used: MaterialItem[];
  downtime_minutes: number;
  notes?: string;
  action: string;
}

interface RepairFormData {
  failure_description: string;
  technician: string;
  duration_minutes: number;
  cost: number;
  materials_used: MaterialItem[];
  downtime_minutes: number;
  root_cause: string;
  corrective_action: string;
  notes?: string;
}

interface LocationFormData {
  location: string;
  checked_out_by: string;
  checked_in_by?: string;
}

interface FormDataState extends Omit<Event, "event_id"> {
  maintenance?: MaintenanceFormData;
  repair?: RepairFormData;
  location?: LocationFormData;
}

const EventModal = ({ onClose, onSubmit }: EventModalProps) => {
  const [eventType, setEventType] = useState<
    "location" | "maintenance" | "repair"
  >("location");
  const [formData, setFormData] = useState<FormDataState>({
    asset_id: "",
    asset_name: "",
    event_type: "location",
    event_date: new Date().toISOString().slice(0, 16),
    event_start: new Date().toISOString().slice(0, 16),
    event_finish: new Date().toISOString().slice(0, 16),
    recorded_by: "",
    description: "",
    status: "open",
    location: {
      location: "",
      checked_out_by: "",
      checked_in_by: "",
    },
  });

  const [newMaterial, setNewMaterial] = useState<MaterialItem>({
    name: "",
    quantity: 1,
    uom: "Pcs",
    price: 0,
  });

  const [isSaving, setIsSaving] = useState(false);
  const auth = useAuth();

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof FormDataState] as object),
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddMaterial = () => {
    if (newMaterial.name.trim() && newMaterial.price >= 0) {
      if (eventType === "maintenance") {
        const currentMaterials = formData.maintenance?.materials_used || [];
        const updatedMaterials = [...currentMaterials, newMaterial];

        setFormData((prev) => ({
          ...prev,
          maintenance: {
            ...prev.maintenance!,
            materials_used: updatedMaterials,
            cost: calculateTotalCost(updatedMaterials),
          },
        }));
      } else if (eventType === "repair") {
        const currentMaterials = formData.repair?.materials_used || [];
        const updatedMaterials = [...currentMaterials, newMaterial];

        setFormData((prev) => ({
          ...prev,
          repair: {
            ...prev.repair!,
            materials_used: updatedMaterials,
            cost: calculateTotalCost(updatedMaterials),
          },
        }));
      }

      setNewMaterial({
        name: "",
        quantity: 1,
        uom: "Pcs",
        price: 0,
      });
    }
  };

  const handleRemoveMaterial = (index: number) => {
    if (eventType === "maintenance") {
      const currentMaterials = formData.maintenance?.materials_used || [];
      const updatedMaterials = [...currentMaterials];
      updatedMaterials.splice(index, 1);

      setFormData((prev) => ({
        ...prev,
        maintenance: {
          ...prev.maintenance!,
          materials_used: updatedMaterials,
          cost: calculateTotalCost(updatedMaterials),
        },
      }));
    } else if (eventType === "repair") {
      const currentMaterials = formData.repair?.materials_used || [];
      const updatedMaterials = [...currentMaterials];
      updatedMaterials.splice(index, 1);

      setFormData((prev) => ({
        ...prev,
        repair: {
          ...prev.repair!,
          materials_used: updatedMaterials,
          cost: calculateTotalCost(updatedMaterials),
        },
      }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    console.log(formData);
    // return

    const event_id = `${eventType === "location" ? "EVT" : "WO"}-${
      eventType === "repair"
        ? "RPR"
        : eventType === "maintenance"
        ? "MTC"
        : "LOC"
    }-${new Date()
      .toISOString()
      .slice(2, 10)
      .replace(/-/g, "")}-${generateCode()}`;

    const eventData = {
      event_id,
      asset_id: formData.asset_id,
      asset_name: formData.asset_name,
      event_type: eventType,
      event_date: formData.event_date,
      event_start: formData.event_start,
      event_finish: formData.event_finish,
      recorded_by: formData.recorded_by,
      description: formData.description,
      status: formData.status,
    };

    let specificEventData;
    if (eventType === "maintenance") {
      specificEventData = {
        ...formData.maintenance,
        cost: calculateTotalCost(formData.maintenance?.materials_used || []),
      };
    } else if (eventType === "repair") {
      specificEventData = {
        ...formData.repair,
        cost: calculateTotalCost(formData.repair?.materials_used || []),
      };
    } else {
      specificEventData = {
        ...formData.location,
      };
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
        setIsSaving(false);
      }
    } catch (error) {
      console.error("Error submitting event:", error);
      setIsSaving(false);
    }
  };

  const renderMaterialRows = () => {
    let materials: MaterialItem[] = [];
    let totalCost = 0;

    if (eventType === "maintenance") {
      materials = formData.maintenance?.materials_used || [];
      totalCost = formData.maintenance?.cost || 0;
    } else if (eventType === "repair") {
      materials = formData.repair?.materials_used || [];
      totalCost = formData.repair?.cost || 0;
    }

    return (
      <div className="mt-4">
        <label className="block text-sm mb-2 font-bold">
          MATERIALS USED (Total: Rp {totalCost.toLocaleString()}):
        </label>
        <div className="space-y-2">
          {materials.map((item, index) => (
            <div key={index} className="flex gap-2 items-center">
              <div className="flex-1 grid grid-cols-4 gap-2">
                <div className="bg-gray-700 p-2 rounded">{item.name}</div>
                <div className="bg-gray-700 p-2 rounded">{item.quantity}</div>
                <div className="bg-gray-700 p-2 rounded">{item.uom}</div>
                <div className="bg-gray-700 p-2 rounded">
                  Rp {(item.quantity * item.price).toLocaleString()}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveMaterial(index)}
                className="text-red-500 hover:text-red-400"
              >
                ✕
              </button>
            </div>
          ))}
          <div className="grid grid-cols-4 gap-2">
            <input
              type="text"
              value={newMaterial.name}
              onChange={(e) =>
                setNewMaterial({ ...newMaterial, name: e.target.value })
              }
              placeholder="Material"
              className="p-2 bg-gray-900 border border-amber-400 rounded"
            />
            <input
              type="number"
              value={newMaterial.quantity}
              onChange={(e) =>
                setNewMaterial({
                  ...newMaterial,
                  quantity: Number(e.target.value),
                })
              }
              placeholder="Qty"
              className="p-2 bg-gray-900 border border-amber-400 rounded"
              min="1"
            />
            <select
              value={newMaterial.uom}
              onChange={(e) =>
                setNewMaterial({ ...newMaterial, uom: e.target.value })
              }
              className="p-2 bg-gray-900 border border-amber-400 rounded"
            >
              {UOM.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <input
                type="number"
                value={newMaterial.price || ""}
                onChange={(e) =>
                  setNewMaterial({
                    ...newMaterial,
                    price: Number(e.target.value),
                  })
                }
                placeholder="Price per unit"
                className="flex-1 p-2 bg-gray-900 border border-amber-400 rounded"
                min="0"
              />
              <button
                type="button"
                onClick={handleAddMaterial}
                className="px-2 bg-amber-600 text-black rounded hover:bg-amber-500"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg border-2 border-amber-400 font-mono text-amber-300 w-full max-w-[75%] max-h-[90vh] flex flex-col shadow-lg shadow-amber-400/20">
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
                onChange={(e) =>
                  setEventType(
                    e.target.value as "location" | "maintenance" | "repair"
                  )
                }
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
                    name="location.location"
                    value={formData.location?.location || ""}
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
                    name="location.checked_out_by"
                    value={formData.location?.checked_out_by || ""}
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
                    name="location.checked_in_by"
                    value={formData.location?.checked_in_by || ""}
                    onChange={handleChange}
                    className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                </div>
              </div>
            )}

            {/* Maintenance Fields */}
            {eventType === "maintenance" && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1 font-bold">
                      MAINTENANCE TYPE:
                    </label>
                    <select
                      name="maintenance.maintenance_type"
                      value={
                        formData.maintenance?.maintenance_type || "preventive"
                      }
                      onChange={handleChange}
                      className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-400"
                    >
                      <option value="preventive">PREVENTIVE</option>
                      <option value="corrective">CORRECTIVE</option>
                      <option value="predictive">PREDICTIVE</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm mb-1 font-bold">
                      TECHNICIAN:
                    </label>
                    <input
                      type="text"
                      name="maintenance.technician"
                      value={formData.maintenance?.technician || ""}
                      onChange={handleChange}
                      className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1 font-bold">
                      FINISH TIME:
                    </label>
                    <input
                      type="datetime-local"
                      name="event_finish"
                      value={formData.event_finish}
                      onChange={handleChange}
                      className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1 font-bold">
                      DURATION (MINUTES):
                    </label>
                    <input
                      type="number"
                      name="maintenance.duration_minutes"
                      value={formData.maintenance?.duration_minutes || 0}
                      onChange={handleChange}
                      className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-400"
                      required
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1 font-bold">
                      DOWNTIME (MINUTES):
                    </label>
                    <input
                      type="number"
                      name="maintenance.downtime_minutes"
                      value={formData.maintenance?.downtime_minutes || 0}
                      onChange={handleChange}
                      className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-400"
                      required
                      min="0"
                    />
                  </div>
                </div>

                {renderMaterialRows()}

                <div>
                  <label className="block text-sm mb-1 font-bold">
                    CORRECTIVE ACTION:
                  </label>
                  <textarea
                    name="maintenance.action"
                    value={formData.maintenance?.action || ""}
                    onChange={handleChange}
                    className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-400"
                    rows={2}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1 font-bold">NOTES:</label>
                  <textarea
                    name="maintenance.notes"
                    value={formData.maintenance?.notes || ""}
                    onChange={handleChange}
                    className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-400"
                    rows={2}
                  />
                </div>
              </>
            )}

            {/* Repair Fields */}
            {eventType === "repair" && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1 font-bold">
                      FAILURE DESCRIPTION:
                    </label>
                    <input
                      type="text"
                      name="repair.failure_description"
                      value={formData.repair?.failure_description || ""}
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
                      name="repair.technician"
                      value={formData.repair?.technician || ""}
                      onChange={handleChange}
                      className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1 font-bold">
                      FINISH TIME:
                    </label>
                    <input
                      type="datetime-local"
                      name="event_finish"
                      value={formData.event_finish}
                      onChange={handleChange}
                      className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1 font-bold">
                      DURATION (MINUTES):
                    </label>
                    <input
                      type="number"
                      name="repair.duration_minutes"
                      value={formData.repair?.duration_minutes || 0}
                      onChange={handleChange}
                      className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-400"
                      required
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1 font-bold">
                      DOWNTIME (MINUTES):
                    </label>
                    <input
                      type="number"
                      name="repair.downtime_minutes"
                      value={formData.repair?.downtime_minutes || 0}
                      onChange={handleChange}
                      className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-400"
                      required
                      min="0"
                    />
                  </div>
                </div>

                {renderMaterialRows()}

                <div>
                  <label className="block text-sm mb-1 font-bold">
                    ROOT CAUSE:
                  </label>
                  <textarea
                    name="repair.root_cause"
                    value={formData.repair?.root_cause || ""}
                    onChange={handleChange}
                    className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-400"
                    rows={2}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1 font-bold">
                    CORRECTIVE ACTION:
                  </label>
                  <textarea
                    name="repair.corrective_action"
                    value={formData.repair?.corrective_action || ""}
                    onChange={handleChange}
                    className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-400"
                    rows={2}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1 font-bold">NOTES:</label>
                  <textarea
                    name="repair.notes"
                    value={formData.repair?.notes || ""}
                    onChange={handleChange}
                    className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-400"
                    rows={2}
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm mb-1 font-bold">STATUS:</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-400"
              >
                <option value="open">OPEN</option>
                <option value="in progress">IN PROGRESS</option>
                <option value="closed">CLOSED</option>
              </select>
            </div>
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
              className="px-4 py-2 bg-amber-600 text-black border-2 border-amber-500 rounded hover:bg-amber-500 font-bold"
              onClick={handleSubmit}
              disabled={isSaving}
            >
              {isSaving ? "SAVING..." : "SAVE EVENT"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
