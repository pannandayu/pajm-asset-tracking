import { useAuth } from "@/context/AuthContext";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useRouter } from "next/router";
import { Fragment, useEffect, useState } from "react";

dayjs.extend(utc);

// ==================== TYPES ====================
type MaterialItem = {
  name: string;
  quantity: number;
  uom: string;
  price: number;
};

type ActionItem = {
  description: string;
  start_time: string;
  finish_time: string;
};

type LocationDetails = {
  location: string;
  checked_out_by: string;
  checked_in_by?: string;
};

type MaintenanceDetails = {
  maintenance_type: string;
  technician: string;
  duration_minutes: number;
  downtime_minutes: number;
  materials_used: MaterialItem[];
  actions: ActionItem[];
  notes: string;
};

type RepairDetails = {
  failure_description: string;
  technician: string;
  duration_minutes: number;
  downtime_minutes: number;
  materials_used: MaterialItem[];
  root_cause: string;
  corrective_action: ActionItem[];
  notes: string;
};

type Event = {
  event_id: string;
  asset_id: string;
  asset_name: string;
  event_type: "location" | "maintenance" | "repair";
  event_date: string;
  event_start: string;
  event_finish: string;
  recorded_by: string;
  status: string;
  description: string;
  location?: LocationDetails;
  maintenance?: MaintenanceDetails;
  repair?: RepairDetails;
};

type EditData = {
  description?: string;
  actions?: ActionItem[];
  notes?: string;
  failure_description?: string;
  root_cause?: string;
  technician?: string;
  maintenance_type?: string;
  location?: {
    location?: string;
    checked_out_by?: string;
    checked_in_by?: string;
  };
  materials_used?: MaterialItem[];
  status?: string;
  event_start?: string;
  event_finish?: string;
  duration_minutes?: number;
  downtime_minutes?: number;
};

// ==================== HELPER FUNCTIONS ====================
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

const calculateTotalCost = (materials: MaterialItem[] = []): number => {
  return materials.reduce(
    (total, item) => total + item.quantity * item.price,
    0
  );
};

const calculateDuration = (start: string, finish: string): number => {
  return dayjs(finish).diff(dayjs(start), "minutes");
};

// ==================== COMPONENTS ====================
const PageContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-gray-700 text-amber-300 p-4 font-mono">
    {children}
  </div>
);

const HeaderSection = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) => (
  <div className="mb-6 border-b-2 border-amber-400 pb-4">
    <h1 className="text-2xl md:text-3xl font-bold tracking-wider text-center">
      {title}
    </h1>
    <p className="text-center text-amber-400 mt-2">{subtitle}</p>
  </div>
);

const SectionTitle = ({ title }: { title: string }) => (
  <h1 className="text-xl md:text-2xl font-bold mb-4 pb-2 border-b border-amber-400">
    {title}
  </h1>
);

const DetailItem = ({
  label,
  value,
  multiline = false,
  fullWidth = false,
  className = "",
}: {
  label: string;
  value: string;
  multiline?: boolean;
  fullWidth?: boolean;
  className?: string;
}) => (
  <div className={fullWidth ? "col-span-2" : className}>
    <h3 className="font-bold text-amber-400 mb-1">{label}:</h3>
    <p
      className={`bg-gray-700 border border-amber-400 p-2 rounded ${
        multiline ? "whitespace-pre-line" : ""
      }`}
    >
      {value}
    </p>
  </div>
);

const TextInput = ({
  label,
  name,
  value,
  onChange,
  fullWidth = false,
  type = "text",
}: {
  label: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fullWidth?: boolean;
  type?: string;
}) => (
  <div className={fullWidth ? "col-span-2" : ""}>
    <label className="font-bold text-amber-400 mb-1 block">{label}:</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full bg-gray-700 border border-amber-400 p-2 rounded text-white"
    />
  </div>
);

const TextAreaInput = ({
  label,
  name,
  value,
  onChange,
  fullWidth = false,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  fullWidth?: boolean;
}) => (
  <div className={fullWidth ? "col-span-2" : ""}>
    <label className="font-bold text-amber-400 mb-1 block">{label}:</label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      rows={4}
      className="w-full bg-gray-700 border border-amber-400 p-2 rounded text-white"
    />
  </div>
);

const DateTimeInput = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) => {
  const formattedValue = dayjs(value).format("YYYY-MM-DDTHH:mm");

  return (
    <div>
      <label className="font-bold text-amber-400 mb-1 block">{label}:</label>
      <input
        type="datetime-local"
        value={formattedValue}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-gray-700 border border-amber-400 p-2 rounded text-white"
      />
    </div>
  );
};

const EditableMaterialsTable = ({
  materials,
  onChange,
}: {
  materials: MaterialItem[];
  onChange: (materials: MaterialItem[]) => void;
}) => {
  const handleMaterialChange = (
    index: number,
    field: keyof MaterialItem,
    value: string | number
  ) => {
    const updatedMaterials = [...materials];
    updatedMaterials[index] = {
      ...updatedMaterials[index],
      [field]:
        field === "quantity" || field === "price" ? Number(value) : value,
    };
    onChange(updatedMaterials);
  };

  const handleAddMaterial = () => {
    onChange([
      ...materials,
      {
        name: "",
        quantity: 0,
        uom: "",
        price: 0,
      },
    ]);
  };

  const handleRemoveMaterial = (index: number) => {
    const updatedMaterials = [...materials];
    updatedMaterials.splice(index, 1);
    onChange(updatedMaterials);
  };

  return (
    <div>
      <h3 className="font-bold text-amber-400 mb-2">Materials Used:</h3>
      <div className="bg-gray-700 border border-amber-400 p-2 rounded overflow-x-auto">
        <table className="w-full min-w-max">
          <thead>
            <tr className="border-b text-sm border-amber-400">
              <th className="text-left pb-1 px-2">Material</th>
              <th className="text-left pb-1 px-2">Qty</th>
              <th className="text-left pb-1 px-2">UoM</th>
              <th className="text-left pb-1 px-2">Unit Price</th>
              <th className="text-left pb-1 px-2">Total</th>
              <th className="text-left pb-1 px-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {materials.map((item, index) => (
              <tr key={index} className="border-b border-gray-600">
                <td className="py-1 px-2">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) =>
                      handleMaterialChange(index, "name", e.target.value)
                    }
                    className="w-full bg-gray-800 border border-gray-600 p-1 rounded"
                  />
                </td>
                <td className="py-1 px-2">
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      handleMaterialChange(index, "quantity", e.target.value)
                    }
                    className="w-full bg-gray-800 border border-gray-600 p-1 rounded"
                  />
                </td>
                <td className="py-1 px-2">
                  <input
                    type="text"
                    value={item.uom}
                    onChange={(e) =>
                      handleMaterialChange(index, "uom", e.target.value)
                    }
                    className="w-full bg-gray-800 border border-gray-600 p-1 rounded"
                  />
                </td>
                <td className="py-1 px-2">
                  <input
                    type="number"
                    value={item.price}
                    onChange={(e) =>
                      handleMaterialChange(index, "price", e.target.value)
                    }
                    className="w-full bg-gray-800 border border-gray-600 p-1 rounded"
                  />
                </td>
                <td className="py-1 px-2">
                  {formatCurrency(item.quantity * item.price)}
                </td>
                <td className="py-1 px-2">
                  <button
                    onClick={() => handleRemoveMaterial(index)}
                    className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white text-sm rounded"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          onClick={handleAddMaterial}
          className="mt-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white border-2 border-green-500 font-bold transition-all"
        >
          + ADD MATERIAL
        </button>
      </div>
    </div>
  );
};

const MaterialsTable = ({
  materials,
  title,
}: {
  materials: MaterialItem[];
  title: string;
}) => (
  <div>
    <h3 className="font-bold text-amber-400 mb-2">{title}:</h3>
    <div className="bg-gray-700 border border-amber-400 p-2 rounded overflow-x-auto">
      <table className="w-full min-w-max">
        <thead>
          <tr className="border-b text-sm border-amber-400">
            <th className="text-left pb-1 px-2">Material</th>
            <th className="text-left pb-1 px-2">Qty</th>
            <th className="text-left pb-1 px-2">UoM</th>
            <th className="text-left pb-1 px-2">Unit Price</th>
            <th className="text-left pb-1 px-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {materials.map((item, index) => (
            <tr key={index} className="border-b border-gray-600">
              <td className="py-1 px-2">{item.name}</td>
              <td className="py-1 px-2">{item.quantity}</td>
              <td className="py-1 px-2">{item.uom}</td>
              <td className="py-1 px-2">{formatCurrency(item.price)}</td>
              <td className="py-1 px-2">
                {formatCurrency(item.quantity * item.price)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const BackButton = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="mt-4 px-4 py-2 bg-amber-700 hover:bg-amber-600 text-black border-2 border-amber-500 font-bold transition-all"
  >
    ← BACK TO EVENTS
  </button>
);

// ==================== MAIN COMPONENT ====================
const EventDetail = () => {
  const auth = useAuth();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<EditData>({});
  const { id: eventId } = router.query;

  const handleBack = () => {
    router.push("/events");
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setEditData({});
    } else {
      if (event) {
        const baseData = {
          description: event.description,
          status: event.status,
          event_date: event.event_date,
          event_start: event.event_start,
          event_finish: event.event_finish,
        };

        if (event.event_type === "maintenance" && event.maintenance) {
          setEditData({
            ...baseData,
            maintenance_type: event.maintenance.maintenance_type,
            technician: event.maintenance.technician,
            actions: [...event.maintenance.actions],
            materials_used: [...event.maintenance.materials_used],
            notes: event.maintenance.notes,
            duration_minutes: event.maintenance.duration_minutes,
            downtime_minutes: event.maintenance.downtime_minutes,
          });
        } else if (event.event_type === "repair" && event.repair) {
          setEditData({
            ...baseData,
            failure_description: event.repair.failure_description,
            technician: event.repair.technician,
            root_cause: event.repair.root_cause,
            actions: [...event.repair.corrective_action],
            materials_used: [...event.repair.materials_used],
            notes: event.repair.notes,
            duration_minutes: event.repair.duration_minutes,
            downtime_minutes: event.repair.downtime_minutes,
          });
        } else if (event.event_type === "location" && event.location) {
          setEditData({
            ...baseData,
            location: {
              location: event.location.location,
              checked_out_by: event.location.checked_out_by,
              checked_in_by: event.location.checked_in_by,
            },
          });
        }
      }
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocationChange = (
    field: keyof LocationDetails,
    value: string
  ) => {
    setEditData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value,
      },
    }));
  };

  const handleActionChange = (
    index: number,
    field: keyof ActionItem,
    value: string
  ) => {
    setEditData((prev) => {
      if (!prev.actions) return prev;
      const updatedActions = [...prev.actions];
      updatedActions[index] = { ...updatedActions[index], [field]: value };
      return { ...prev, actions: updatedActions };
    });
  };

  const handleMaterialsChange = (materials: MaterialItem[]) => {
    setEditData((prev) => ({ ...prev, materials_used: materials }));
  };

  const handleAddAction = () => {
    setEditData((prev) => ({
      ...prev,
      actions: [
        ...(prev.actions || []),
        {
          description: "",
          start_time: dayjs().toISOString(),
          finish_time: dayjs().toISOString(),
        },
      ],
    }));
  };

  const handleRemoveAction = (index: number) => {
    setEditData((prev) => {
      if (!prev.actions) return prev;
      const updatedActions = [...prev.actions];
      updatedActions.splice(index, 1);
      return { ...prev, actions: updatedActions };
    });
  };

  const handleDateTimeChange = (
    field: "event_start" | "event_finish",
    value: string
  ) => {
    setEditData((prev) => ({ ...prev, [field]: value }));

    // Recalculate duration if both start and finish are present
    if (field === "event_start" && editData.event_finish) {
      const duration = calculateDuration(value, editData.event_finish);
      setEditData((prev) => ({ ...prev, duration_minutes: duration }));
    } else if (field === "event_finish" && editData.event_start) {
      const duration = calculateDuration(editData.event_start, value);
      setEditData((prev) => ({ ...prev, duration_minutes: duration }));
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      console.log(editData);
      // setLoading(false);
      // return;

      let eventType;
      if (eventId?.includes("RPR")) {
        eventType = "repair";
      } else if (eventId?.includes("MTC")) {
        eventType = "maintenance";
      } else {
        eventType = "location";
      }

      const response = await fetch("/api/update-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          editData: {
            ...editData,
            downtime_minutes: Number(editData.downtime_minutes),
            duration_minutes: Number(editData.duration_minutes),
            notes: editData.notes || "",
          },
          eventType,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        fetchEvent();
        setIsEditing(false);
        setEditData({});
      } else {
        throw new Error(result.error || "Failed to update event");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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

      if (response.ok) {
        setEvent(result);
        console.log(result);
      } else {
        throw new Error(result.error || "Failed to fetch event");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!auth.user) {
      router.push("/");
      return;
    }

    if (eventId) {
      fetchEvent();
    }
  }, [auth.user, eventId]);

  const renderActionList = (actions: ActionItem[] = []) => {
    return (
      <div className="space-y-4">
        {actions.map((action, index) => (
          <div
            key={index}
            className="bg-gray-700 border border-amber-400 p-4 rounded"
          >
            <h4 className="font-bold text-amber-300 mb-2">
              Action #{index + 1}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailItem
                label="Description"
                value={action.description || "-"}
              />
              <DetailItem
                label="Start Time"
                value={dayjs(action.start_time).format("DD MMM YYYY - HH:mm")}
              />
              <DetailItem
                label="Finish Time"
                value={dayjs(action.finish_time).format("DD MMM YYYY - HH:mm")}
              />
              <DetailItem
                label="Duration"
                value={`${calculateDuration(
                  action.start_time,
                  action.finish_time
                )} minutes`}
              />
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderEditableActionList = (actions: ActionItem[] = []) => {
    return (
      <div className="space-y-4">
        {actions.map((action, index) => (
          <div
            key={index}
            className="bg-gray-700 border border-amber-400 p-4 rounded"
          >
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-bold text-amber-300">Action #{index + 1}</h4>
              <button
                onClick={() => handleRemoveAction(index)}
                className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white text-sm"
              >
                Remove
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextAreaInput
                label="Description"
                name={`action-${index}-description`}
                value={action.description}
                onChange={(e) =>
                  handleActionChange(index, "description", e.target.value)
                }
              />
              <DateTimeInput
                label="Start Time"
                value={action.start_time}
                onChange={(value) =>
                  handleActionChange(index, "start_time", value)
                }
              />
              <DateTimeInput
                label="Finish Time"
                value={action.finish_time}
                onChange={(value) =>
                  handleActionChange(index, "finish_time", value)
                }
              />
              <DetailItem
                label="Duration"
                value={`${calculateDuration(
                  action.start_time,
                  action.finish_time
                )} minutes`}
              />
            </div>
          </div>
        ))}
        <button
          onClick={handleAddAction}
          className="mt-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white border-2 border-green-500 font-bold transition-all"
        >
          + ADD ACTION
        </button>
      </div>
    );
  };

  const renderLocationDetails = () => {
    if (!event?.location) return null;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isEditing ? (
            <TextInput
              label="Location"
              name="location"
              value={editData.location?.location || ""}
              onChange={(e) => handleLocationChange("location", e.target.value)}
            />
          ) : (
            <DetailItem
              label="Location"
              value={event.location.location || "-"}
            />
          )}

          {isEditing ? (
            <TextInput
              label="Checked Out By"
              name="checked_out_by"
              value={editData.location?.checked_out_by || ""}
              onChange={(e) =>
                handleLocationChange("checked_out_by", e.target.value)
              }
            />
          ) : (
            <DetailItem
              label="Checked Out By"
              value={event.location.checked_out_by || "-"}
            />
          )}

          {event.location.checked_in_by &&
            (isEditing ? (
              <TextInput
                label="Checked In By"
                name="checked_in_by"
                value={editData.location?.checked_in_by || ""}
                onChange={(e) =>
                  handleLocationChange("checked_in_by", e.target.value)
                }
                fullWidth
              />
            ) : (
              <DetailItem
                label="Checked In By"
                value={event.location.checked_in_by}
                fullWidth
              />
            ))}
        </div>
      </div>
    );
  };

  const renderMaintenanceDetails = () => {
    if (!event?.maintenance) return null;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DetailItem
            label="Type"
            value={event.maintenance.maintenance_type?.toUpperCase() || "-"}
          />

          {isEditing ? (
            <TextInput
              label="Technician"
              name="technician"
              value={editData.technician || ""}
              onChange={handleInputChange}
            />
          ) : (
            <DetailItem
              label="Technician"
              value={event.maintenance.technician || "-"}
            />
          )}

          {isEditing ? (
            <DateTimeInput
              label="Event Start"
              value={editData.event_start || event.event_start}
              onChange={(value) => handleDateTimeChange("event_start", value)}
            />
          ) : (
            <DetailItem
              label="Event Start"
              value={dayjs(event.event_start)
                .utc()
                .format("DD MMM YYYY - HH:mm")}
            />
          )}

          {isEditing ? (
            <DateTimeInput
              label="Event Finish"
              value={editData.event_finish || event.event_finish}
              onChange={(value) => handleDateTimeChange("event_finish", value)}
            />
          ) : (
            <DetailItem
              label="Event Finish"
              value={dayjs(event.event_finish)
                .utc()
                .format("DD MMM YYYY - HH:mm")}
            />
          )}

          {isEditing ? (
            <TextInput
              label="Duration (minutes)"
              name="duration_minutes"
              type="number"
              value={
                editData.duration_minutes ?? event.maintenance.duration_minutes
              }
              onChange={handleInputChange}
            />
          ) : (
            <DetailItem
              label="Duration"
              value={`${event.maintenance.duration_minutes || 0} minutes`}
            />
          )}

          {isEditing ? (
            <TextInput
              label="Downtime (minutes)"
              name="downtime_minutes"
              type="number"
              value={
                editData.downtime_minutes ?? event.maintenance.downtime_minutes
              }
              onChange={handleInputChange}
            />
          ) : (
            <DetailItem
              label="Downtime"
              value={`${event.maintenance.downtime_minutes || 0} minutes`}
            />
          )}

          <DetailItem
            label="Total Cost"
            value={formatCurrency(
              calculateTotalCost(
                isEditing && editData.materials_used
                  ? editData.materials_used
                  : event.maintenance.materials_used
              )
            )}
            fullWidth
          />
        </div>

        {isEditing ? (
          <EditableMaterialsTable
            materials={
              editData.materials_used || event.maintenance.materials_used
            }
            onChange={handleMaterialsChange}
          />
        ) : event.maintenance.materials_used?.length > 0 ? (
          <MaterialsTable
            materials={event.maintenance.materials_used}
            title="Materials Used"
          />
        ) : null}

        <SectionTitle title="MAINTENANCE ACTIONS" />
        {isEditing
          ? renderEditableActionList(editData.actions || [])
          : renderActionList(event.maintenance.actions)}

        {isEditing ? (
          <TextAreaInput
            label="Notes"
            name="notes"
            value={editData.notes || ""}
            onChange={handleInputChange}
          />
        ) : (
          <DetailItem
            label="Notes"
            value={event.maintenance.notes || "-"}
            multiline
          />
        )}
      </div>
    );
  };

  const renderRepairDetails = () => {
    if (!event?.repair) return null;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isEditing ? (
            <TextAreaInput
              label="Failure Description"
              name="failure_description"
              value={editData.failure_description || ""}
              onChange={handleInputChange}
              fullWidth
            />
          ) : (
            <DetailItem
              label="Failure Description"
              value={event.repair.failure_description || "-"}
              fullWidth
            />
          )}

          {isEditing ? (
            <TextInput
              label="Technician"
              name="technician"
              value={editData.technician || ""}
              onChange={handleInputChange}
            />
          ) : (
            <DetailItem
              label="Technician"
              value={event.repair.technician || "-"}
            />
          )}

          {isEditing ? (
            <DateTimeInput
              label="Event Start"
              value={editData.event_start || event.event_start}
              onChange={(value) => handleDateTimeChange("event_start", value)}
            />
          ) : (
            <DetailItem
              label="Event Start"
              value={dayjs(event.event_start).format("DD MMM YYYY - HH:mm")}
            />
          )}

          {isEditing ? (
            <DateTimeInput
              label="Event Finish"
              value={editData.event_finish || event.event_finish}
              onChange={(value) => handleDateTimeChange("event_finish", value)}
            />
          ) : (
            <DetailItem
              label="Event Finish"
              value={dayjs(event.event_finish).format("DD MMM YYYY - HH:mm")}
            />
          )}

          {isEditing ? (
            <TextInput
              label="Duration (minutes)"
              name="duration_minutes"
              type="number"
              value={editData.duration_minutes ?? event.repair.duration_minutes}
              onChange={handleInputChange}
            />
          ) : (
            <DetailItem
              label="Duration"
              value={`${event.repair.duration_minutes || 0} minutes`}
            />
          )}

          {isEditing ? (
            <TextInput
              label="Downtime (minutes)"
              name="downtime_minutes"
              type="number"
              value={editData.downtime_minutes ?? event.repair.downtime_minutes}
              onChange={handleInputChange}
            />
          ) : (
            <DetailItem
              label="Downtime"
              value={`${event.repair.downtime_minutes || 0} minutes`}
            />
          )}

          <DetailItem
            label="Total Cost"
            value={formatCurrency(
              calculateTotalCost(
                isEditing && editData.materials_used
                  ? editData.materials_used
                  : event.repair.materials_used
              )
            )}
            fullWidth
          />
        </div>

        {isEditing ? (
          <EditableMaterialsTable
            materials={editData.materials_used || event.repair.materials_used}
            onChange={handleMaterialsChange}
          />
        ) : event.repair.materials_used?.length > 0 ? (
          <MaterialsTable
            materials={event.repair.materials_used}
            title="Materials Used"
          />
        ) : null}

        <SectionTitle title="CORRECTIVE ACTIONS" />
        {isEditing
          ? renderEditableActionList(editData.actions || [])
          : renderActionList(event.repair.corrective_action)}

        {isEditing ? (
          <TextAreaInput
            label="Root Cause"
            name="root_cause"
            value={editData.root_cause || event.repair.root_cause || ""}
            onChange={handleInputChange}
          />
        ) : (
          <DetailItem
            label="Root Cause"
            value={event.repair.root_cause || "-"}
            multiline
          />
        )}

        {isEditing ? (
          <TextAreaInput
            label="Notes"
            name="notes"
            value={editData.notes || event.repair.notes || ""}
            onChange={handleInputChange}
          />
        ) : (
          <DetailItem
            label="Notes"
            value={event.repair.notes || "-"}
            multiline
          />
        )}
      </div>
    );
  };

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

  if (loading) {
    return (
      <PageContainer>
        <div className="max-w-6xl mx-auto border-2 border-amber-400 bg-gray-800 p-6 shadow-lg shadow-amber-400/20 text-center">
          <p className="text-xl">LOADING EVENT DATA...</p>
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <div className="max-w-6xl mx-auto border-2 border-red-500 bg-gray-800 p-6 shadow-lg shadow-red-500/20">
          <p className="text-red-400 font-bold">ERROR:</p>
          <p className="text-red-300">{error}</p>
          <BackButton onClick={handleBack} />
        </div>
      </PageContainer>
    );
  }

  if (!event) {
    return (
      <PageContainer>
        <div className="max-w-6xl mx-auto border-2 border-amber-400 bg-gray-800 p-6 shadow-lg shadow-amber-400/20 text-center">
          <p className="text-xl">EVENT NOT FOUND</p>
          <BackButton onClick={handleBack} />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="max-w-6xl mx-auto border-2 border-amber-400 bg-gray-800 p-6 shadow-lg shadow-amber-400/20">
        <HeaderSection title="EVENT DETAILS" subtitle={event.event_id} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <SectionTitle title="GENERAL INFO" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailItem
                label="Event Type"
                value={event.event_type.toUpperCase()}
              />
              <DetailItem label="Asset ID" value={event.asset_id} />
              <DetailItem label="Asset Name" value={event.asset_name} />
              {isEditing ? (
                <TextAreaInput
                  label="Description"
                  name="description"
                  value={editData.description || ""}
                  onChange={handleInputChange}
                  fullWidth
                />
              ) : (
                <DetailItem
                  label="Description"
                  value={event.description || "-"}
                />
              )}
              <DetailItem
                label="Event Date"
                value={dayjs(event.event_date)
                  .utc()
                  .format("DD MMM YYYY - HH:mm")}
              />
              <DetailItem label="Recorded By" value={event.recorded_by} />
              {isEditing ? (
                <TextInput
                  label="Status"
                  name="status"
                  value={editData.status || ""}
                  onChange={handleInputChange}
                />
              ) : (
                <DetailItem
                  label="Status"
                  value={event.status[0].toUpperCase() + event.status.slice(1)}
                />
              )}
            </div>
          </div>

          <div>
            <SectionTitle title={`${event.event_type.toUpperCase()} DETAILS`} />
            {renderEventDetails()}
          </div>
        </div>

        <div className="flex justify-between">
          <BackButton onClick={handleBack} />
          <div className="space-x-4">
            {isEditing ? (
              <>
                <button
                  onClick={handleEditToggle}
                  className="mt-4 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white border-2 border-gray-500 font-bold transition-all"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleSave}
                  className="mt-4 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black border-2 border-amber-400 font-bold transition-all"
                >
                  SAVE CHANGES
                </button>
              </>
            ) : auth.user?.tagging !== "2" ? (
              <button
                onClick={handleEditToggle}
                className="mt-4 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black border-2 border-amber-400 font-bold transition-all"
              >
                UPDATE EVENT
              </button>
            ) : (
              <Fragment />
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default EventDetail;
