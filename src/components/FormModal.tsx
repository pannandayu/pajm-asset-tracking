import { useState, ChangeEvent, FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { MaterialItem, Event } from "@/types";
import dayjs from "dayjs";
import "dayjs/locale/id";

// Constants
const UOM_OPTIONS = [
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
] as const;

const MAINTENANCE_TYPES = ["preventive", "corrective", "predictive"] as const;

const EVENT_STATUSES = ["open", "in progress", "closed"] as const;

type MaintenanceType = (typeof MAINTENANCE_TYPES)[number];
type EventStatus = (typeof EVENT_STATUSES)[number];
type EventType = "location" | "maintenance" | "repair";

// Helper functions
const generateEventId = (eventType: EventType): string => {
  const prefix =
    eventType === "location"
      ? "EVT-LOC"
      : eventType === "maintenance"
      ? "WO-MTC"
      : "WO-RPR";
  const datePart = dayjs().locale("id").format("DDMMYY");

  // Generate 3 random letters (A-Z)
  const letters = Array.from({ length: 3 }, () =>
    String.fromCharCode(65 + Math.floor(Math.random() * 26))
  ).join("");

  // Generate 3 random digits (0-9)
  const numbers = Array.from({ length: 3 }, () =>
    Math.floor(Math.random() * 10)
  ).join("");

  const randomPart = `${letters}${numbers}`; // e.g., "ABC123"

  return `${prefix}-${datePart}-${randomPart}`;
};

const calculateTotalCost = (materials: MaterialItem[]): number => {
  return materials.reduce(
    (total, item) => total + item.quantity * item.price,
    0
  );
};

const calculateDuration = (start: string, finish: string): number => {
  return dayjs(finish).diff(dayjs(start), "minutes");
};

// Types
interface ActionItem {
  description: string;
  start_time: string;
  finish_time: string;
}

interface EventModalProps {
  onClose: () => void;
  onSubmit: () => void;
}

interface MaintenanceFormData {
  maintenance_type: MaintenanceType;
  technician: string;
  duration_minutes: number;
  cost: number;
  materials_used: MaterialItem[];
  downtime_minutes: number;
  notes?: string;
  actions: ActionItem[];
}

interface RepairFormData {
  failure_description: string;
  technician: string;
  duration_minutes: number;
  cost: number;
  materials_used: MaterialItem[];
  downtime_minutes: number;
  root_cause: string;
  corrective_action: ActionItem[];
  notes?: string;
}

interface LocationFormData {
  location: string;
  checked_out_by: string;
  checked_in_by?: string;
}

type FormDataState = {
  asset_id: string;
  asset_name: string;
  event_type: EventType;
  event_date: string;
  event_start: string;
  event_finish: string;
  recorded_by: string;
  description: string;
  status: EventStatus;
  location?: LocationFormData;
  maintenance?: MaintenanceFormData;
  repair?: RepairFormData;
};

// Type guard functions
function isMaintenanceFormData(
  data: MaintenanceFormData | RepairFormData
): data is MaintenanceFormData {
  return (data as MaintenanceFormData).maintenance_type !== undefined;
}

const EventModal = ({ onClose, onSubmit }: EventModalProps) => {
  const auth = useAuth();
  const [eventType, setEventType] = useState<EventType>("location");
  const [formData, setFormData] = useState<FormDataState>(getInitialFormData());
  const [newMaterial, setNewMaterial] = useState<MaterialItem>(
    getInitialMaterial()
  );
  const [newAction, setNewAction] = useState<ActionItem>(getInitialAction());
  const [isSaving, setIsSaving] = useState(false);

  function getInitialFormData(): FormDataState {
    const now = new Date().toISOString().slice(0, 16);
    return {
      asset_id: "",
      asset_name: "",
      event_type: "location",
      event_date: now,
      event_start: now,
      event_finish: now,
      recorded_by: auth.user?.name || "",
      description: "",
      status: "open",
      location: {
        location: "",
        checked_out_by: "",
      },
      maintenance: {
        maintenance_type: "preventive",
        technician: "",
        duration_minutes: 0,
        cost: 0,
        materials_used: [],
        downtime_minutes: 0,
        actions: [],
      },
      repair: {
        failure_description: "",
        technician: "",
        duration_minutes: 0,
        cost: 0,
        materials_used: [],
        downtime_minutes: 0,
        root_cause: "",
        corrective_action: [],
      },
    };
  }

  function getInitialMaterial(): MaterialItem {
    return {
      name: "",
      quantity: 1,
      uom: "Pcs",
      price: 0,
    };
  }

  function getInitialAction(): ActionItem {
    const now = new Date().toISOString().slice(0, 16);
    return {
      description: "",
      start_time: now,
      finish_time: now,
    };
  }

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

  // Material handlers
  const handleMaterialChange = (
    field: keyof MaterialItem,
    value: string | number
  ) => {
    setNewMaterial((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddMaterial = () => {
    if (!newMaterial.name.trim() || newMaterial.price < 0) return;

    const field = eventType === "maintenance" ? "maintenance" : "repair";
    const currentMaterials = formData[field]?.materials_used || [];
    const updatedMaterials = [...currentMaterials, newMaterial];

    setFormData((prev) => ({
      ...prev,
      [field]: {
        ...prev[field]!,
        materials_used: updatedMaterials,
        cost: calculateTotalCost(updatedMaterials),
      },
    }));

    setNewMaterial(getInitialMaterial());
  };

  const handleRemoveMaterial = (index: number) => {
    const field = eventType === "maintenance" ? "maintenance" : "repair";
    const currentMaterials = formData[field]?.materials_used || [];
    const updatedMaterials = [...currentMaterials];
    updatedMaterials.splice(index, 1);

    setFormData((prev) => ({
      ...prev,
      [field]: {
        ...prev[field]!,
        materials_used: updatedMaterials,
        cost: calculateTotalCost(updatedMaterials),
      },
    }));
  };

  // Action handlers
  const handleActionChange = (field: keyof ActionItem, value: string) => {
    setNewAction((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddAction = () => {
    if (!newAction.description.trim()) return;

    if (eventType === "maintenance") {
      const currentActions = formData.maintenance?.actions || [];
      const updatedActions = [...currentActions, newAction];

      setFormData((prev) => ({
        ...prev,
        maintenance: {
          ...prev.maintenance!,
          actions: updatedActions,
        },
      }));
    } else if (eventType === "repair") {
      const currentActions = formData.repair?.corrective_action || [];
      const updatedActions = [...currentActions, newAction];

      setFormData((prev) => ({
        ...prev,
        repair: {
          ...prev.repair!,
          corrective_action: updatedActions,
        },
      }));
    }

    setNewAction(getInitialAction());
  };

  const handleRemoveAction = (index: number) => {
    if (eventType === "maintenance") {
      const currentActions = formData.maintenance?.actions || [];
      const updatedActions = [...currentActions];
      updatedActions.splice(index, 1);

      setFormData((prev) => ({
        ...prev,
        maintenance: {
          ...prev.maintenance!,
          actions: updatedActions,
        },
      }));
    } else if (eventType === "repair") {
      const currentActions = formData.repair?.corrective_action || [];
      const updatedActions = [...currentActions];
      updatedActions.splice(index, 1);

      setFormData((prev) => ({
        ...prev,
        repair: {
          ...prev.repair!,
          corrective_action: updatedActions,
        },
      }));
    }
  };

  // Form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const event_id = generateEventId(eventType);
      const eventData: Event = {
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
      switch (eventType) {
        case "maintenance":
          specificEventData = formData.maintenance;
          break;
        case "repair":
          specificEventData = formData.repair;
          break;
        case "location":
          specificEventData = formData.location;
          break;
      }

      console.log({
        eventData,
        specificEventData,
        eventType,
      });
      // setIsSaving(false);
      // return;

      const response = await fetch("/api/post-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventData,
          specificEventData,
          eventType,
        }),
      });

      if (!response.ok) throw new Error("Failed to submit event");

      onSubmit();
      onClose();
    } catch (error) {
      console.error("Error submitting event:", error);
      setIsSaving(false);
    }
  };

  // Render helpers
  const renderMaterialRows = () => {
    if (eventType === "location") return null;

    const field = eventType === "maintenance" ? "maintenance" : "repair";
    const materials = formData[field]?.materials_used || [];
    const totalCost = formData[field]?.cost || 0;

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
              onChange={(e) => handleMaterialChange("name", e.target.value)}
              placeholder="Material"
              className="p-2 bg-gray-900 border border-amber-400 rounded"
            />
            <input
              type="number"
              value={newMaterial.quantity}
              onChange={(e) =>
                handleMaterialChange("quantity", Number(e.target.value))
              }
              placeholder="Qty"
              className="p-2 bg-gray-900 border border-amber-400 rounded"
              min="1"
            />
            <select
              value={newMaterial.uom}
              onChange={(e) => handleMaterialChange("uom", e.target.value)}
              className="p-2 bg-gray-900 border border-amber-400 rounded"
            >
              {UOM_OPTIONS.map((unit) => (
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
                  handleMaterialChange("price", Number(e.target.value))
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

  const renderActionRows = () => {
    if (eventType === "location") return null;

    let actions: ActionItem[] = [];
    let title = "";

    if (eventType === "maintenance") {
      actions = formData.maintenance?.actions || [];
      title = "MAINTENANCE ACTIONS";
    } else if (eventType === "repair") {
      actions = formData.repair?.corrective_action || [];
      title = "CORRECTIVE ACTIONS";
    }

    return (
      <div className="mt-4">
        <label className="block text-sm mb-2 font-bold">{title}:</label>
        <div className="space-y-2">
          {actions.map((action: ActionItem, index: number) => (
            <div key={index} className="flex gap-2 items-center">
              <div className="flex-1 grid grid-cols-4 gap-2">
                <div className="bg-gray-700 p-2 rounded">
                  {action.description}
                </div>
                <div className="bg-gray-700 p-2 rounded">
                  {dayjs(action.start_time).utc().format("DD/MM/YYYY HH:mm")}
                </div>
                <div className="bg-gray-700 p-2 rounded">
                  {dayjs(action.finish_time).utc().format("DD/MM/YYYY HH:mm")}
                </div>
                <div className="bg-gray-700 p-2 rounded">
                  {calculateDuration(action.start_time, action.finish_time)} min
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveAction(index)}
                className="text-red-500 hover:text-red-400"
              >
                ✕
              </button>
            </div>
          ))}
          <div className="grid grid-cols-4 gap-2">
            <input
              type="text"
              value={newAction.description}
              onChange={(e) =>
                handleActionChange("description", e.target.value)
              }
              placeholder="Action description"
              className="p-2 bg-gray-900 border border-amber-400 rounded"
            />
            <input
              type="datetime-local"
              value={newAction.start_time}
              onChange={(e) => handleActionChange("start_time", e.target.value)}
              className="p-2 bg-gray-900 border border-amber-400 rounded"
            />
            <input
              type="datetime-local"
              value={newAction.finish_time}
              onChange={(e) =>
                handleActionChange("finish_time", e.target.value)
              }
              className="p-2 bg-gray-900 border border-amber-400 rounded"
            />
            <div className="flex gap-2">
              <div className="flex-1 bg-gray-700 p-2 rounded">
                {newAction.start_time && newAction.finish_time
                  ? `${calculateDuration(
                      newAction.start_time,
                      newAction.finish_time
                    )} min`
                  : "Duration"}
              </div>
              <button
                type="button"
                onClick={handleAddAction}
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
                onChange={(e) => setEventType(e.target.value as EventType)}
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
                      {MAINTENANCE_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type.toUpperCase()}
                        </option>
                      ))}
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
                {renderActionRows()}

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

                {renderActionRows()}

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
                {EVENT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status.toUpperCase()}
                  </option>
                ))}
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
