import DataRow from "@/components/DataRow";
import dayjs from "dayjs";
import { useState } from "react";

interface ComponentFormProps {
  assetId: string;
  onClose: () => void;
  onSubmit: () => void;
}

const ComponentForm = ({ assetId, onClose, onSubmit }: ComponentFormProps) => {
  const [component, setComponent] = useState({
    id: "",
    name: "",
    brand: "",
    model: "",
    serial_number: "",
    part_number: "",
    supplier_vendor: "",
    purchase_price: 0,
    purchase_order_number: "",
    purchase_date: dayjs().format("YYYY-MM-DD"),
    status: "Active",
    warranty: "",
    active_date: dayjs().format("YYYY-MM-DD"),
    expected_lifespan: 0,
    notes_purchase: "",
    notes_component: "",
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (
    field: keyof typeof component,
    value: string | number
  ) => {
    setComponent((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setIsSaving(true);

    console.log({
      assetId,
      component,
    });

    // return;

    try {
      const response = await fetch("/api/add-component", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetId,
          component,
        }),
      });

      if (!response.ok) throw new Error("Failed to add component");

      onSubmit();
    } catch (error) {
      console.error("Error adding component:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 border-2 border-amber-400 p-6 max-w-2xl w-full max-h-screen overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4 border-b border-amber-400 pb-2">
          Add New Component
        </h2>

        <div className="space-y-4">
          <DataRow
            label="ID"
            data={
              <input
                className="bg-gray-700 text-amber-300 border border-amber-400 p-1 w-full"
                value={component.id}
                onChange={(e) => handleChange("id", e.target.value)}
              />
            }
          />
          <DataRow
            label="Name"
            data={
              <input
                className="bg-gray-700 text-amber-300 border border-amber-400 p-1 w-full"
                value={component.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
            }
          />
          <DataRow
            label="Brand"
            data={
              <input
                className="bg-gray-700 text-amber-300 border border-amber-400 p-1 w-full"
                value={component.brand}
                onChange={(e) => handleChange("brand", e.target.value)}
              />
            }
          />
          <DataRow
            label="Model"
            data={
              <input
                className="bg-gray-700 text-amber-300 border border-amber-400 p-1 w-full"
                value={component.model}
                onChange={(e) => handleChange("model", e.target.value)}
              />
            }
          />

          {/* ARCHIVE SECTION START */}

          <DataRow
            label="Serial Number"
            data={
              <input
                className="bg-gray-700 text-amber-300 border border-amber-400 p-1 w-full"
                value={component.serial_number}
                onChange={(e) => handleChange("serial_number", e.target.value)}
              />
            }
          />
          <DataRow
            label="Part Number"
            data={
              <input
                className="bg-gray-700 text-amber-300 border border-amber-400 p-1 w-full"
                value={component.part_number}
                onChange={(e) => handleChange("part_number", e.target.value)}
              />
            }
          />
          <DataRow
            label="Vendor"
            data={
              <input
                className="bg-gray-700 text-amber-300 border border-amber-400 p-1 w-full"
                value={component.supplier_vendor}
                onChange={(e) =>
                  handleChange("supplier_vendor", e.target.value)
                }
              />
            }
          />
          <DataRow
            label="Purchase Price"
            data={
              <input
                type="number"
                className="bg-gray-700 text-amber-300 border border-amber-400 p-1 w-full"
                value={component.purchase_price}
                onChange={(e) => handleChange("purchase_price", e.target.value)}
              />
            }
          />

          <DataRow
            label="Purchase Order Number"
            data={
              <input
                type="text"
                className="bg-gray-700 text-amber-300 border border-amber-400 p-1 w-full"
                value={component.purchase_order_number}
                onChange={(e) =>
                  handleChange("purchase_order_number", e.target.value)
                }
              />
            }
          />

          <DataRow
            label="Purchase Date"
            data={
              <input
                type="date"
                className="bg-gray-700 text-amber-300 border border-amber-400 p-1 w-full"
                value={component.purchase_date}
                onChange={(e) => handleChange("purchase_date", e.target.value)}
              />
            }
          />

          <DataRow
            label="Active Date"
            data={
              <input
                type="date"
                className="bg-gray-700 text-amber-300 border border-amber-400 p-1 w-full"
                value={component.active_date}
                onChange={(e) => handleChange("active_date", e.target.value)}
              />
            }
          />

          <DataRow
            label="Warranty"
            data={
              <input
                type="text"
                className="bg-gray-700 text-amber-300 border border-amber-400 p-1 w-full"
                value={component.warranty}
                onChange={(e) => handleChange("warranty", e.target.value)}
              />
            }
          />

          <DataRow
            label="Status"
            data={
              <select
                className="bg-gray-700 text-amber-300 border border-amber-400 p-1 w-full"
                value={component.status}
                onChange={(e) => handleChange("status", e.target.value)}
              >
                <option value="">Select Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            }
          />

          <DataRow
            label="Purchase Notes"
            data={
              <textarea
                className="bg-gray-700 text-amber-300 border border-amber-400 p-1 w-full"
                rows={3}
                value={component.notes_purchase}
                onChange={(e) => handleChange("notes_purchase", e.target.value)}
              />
            }
          />

          <DataRow
            label="Component Notes"
            data={
              <textarea
                className="bg-gray-700 text-amber-300 border border-amber-400 p-1 w-full"
                rows={3}
                value={component.notes_component}
                onChange={(e) =>
                  handleChange("notes_component", e.target.value)
                }
              />
            }
          />

          <div className="flex justify-end gap-4 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-amber-300 border-2 border-amber-400 font-bold transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-amber-700 hover:bg-amber-500 text-black border-2 border-amber-500 font-bold transition-all"
            >
              {isSaving ? "SAVING..." : "SAVE"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComponentForm;
