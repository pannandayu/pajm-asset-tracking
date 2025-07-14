import DataRow from "@/components/DataRow";
import dayjs from "dayjs";
import { useState } from "react";

interface ComplementaryFormProps {
  assetId: string;
  onClose: () => void;
  onSubmit: () => void;
}

const ComplementaryForm = ({
  assetId,
  onClose,
  onSubmit,
}: ComplementaryFormProps) => {
  const [complementary, setComplementary] = useState({
    id: "",
    name: "",
    brand: "",
    model: "",
    category: "",
    sub_category: "",
    department_owner: "",
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
    depreciation_method: "Straight-Line",
    depreciation_rate: 0,
    notes: "",
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (
    field: keyof typeof complementary,
    value: string | number
  ) => {
    setComplementary((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setIsSaving(true);

    try {
      const response = await fetch("/api/add-complementary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetId,
          complementary,
        }),
      });

      if (!response.ok) throw new Error("Failed to add complementary asset");

      onSubmit();
    } catch (error) {
      console.error("Error adding complementary asset:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 border-2 border-amber-400 p-6 max-w-2xl w-full max-h-screen overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4 border-b border-amber-400 pb-2">
          Add New Complementary Asset
        </h2>

        <div className="space-y-4">
          <DataRow
            label="ID"
            data={
              <input
                className="bg-gray-700 text-amber-300 border border-amber-400 p-1 w-full"
                value={complementary.id}
                onChange={(e) => handleChange("id", e.target.value)}
              />
            }
          />
          <DataRow
            label="Name"
            data={
              <input
                className="bg-gray-700 text-amber-300 border border-amber-400 p-1 w-full"
                value={complementary.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
            }
          />
          <DataRow
            label="Brand"
            data={
              <input
                className="bg-gray-700 text-amber-300 border border-amber-400 p-1 w-full"
                value={complementary.brand}
                onChange={(e) => handleChange("brand", e.target.value)}
              />
            }
          />

          <DataRow
            label="Model"
            data={
              <input
                className="bg-gray-700 text-amber-300 border border-amber-400 p-1 w-full"
                value={complementary.model}
                onChange={(e) => handleChange("model", e.target.value)}
              />
            }
          />

          <DataRow
            label="Category"
            data={
              <input
                className="bg-gray-700 text-amber-300 border border-amber-400 p-1 w-full"
                value={complementary.category}
                onChange={(e) => handleChange("category", e.target.value)}
              />
            }
          />
          <DataRow
            label="Sub-Category"
            data={
              <input
                className="bg-gray-700 text-amber-300 border border-amber-400 p-1 w-full"
                value={complementary.sub_category}
                onChange={(e) => handleChange("sub_category", e.target.value)}
              />
            }
          />
          <DataRow
            label="Ownership (Dept.)"
            data={
              <input
                className="bg-gray-700 text-amber-300 border border-amber-400 p-1 w-full"
                value={complementary.department_owner}
                onChange={(e) =>
                  handleChange("department_owner", e.target.value)
                }
              />
            }
          />

          {/* ARCHIVE SECTION START */}
          <DataRow
            label="Serial Number"
            data={
              <input
                className="bg-gray-700 text-amber-300 border border-amber-400 p-1 w-full"
                value={complementary.serial_number}
                onChange={(e) => handleChange("serial_number", e.target.value)}
              />
            }
          />
          <DataRow
            label="Part Number"
            data={
              <input
                className="bg-gray-700 text-amber-300 border border-amber-400 p-1 w-full"
                value={complementary.part_number}
                onChange={(e) => handleChange("part_number", e.target.value)}
              />
            }
          />
          <DataRow
            label="Vendor"
            data={
              <input
                className="bg-gray-700 text-amber-300 border border-amber-400 p-1 w-full"
                value={complementary.supplier_vendor}
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
                value={complementary.purchase_price}
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
                value={complementary.purchase_order_number}
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
                value={complementary.purchase_date}
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
                value={complementary.active_date}
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
                value={complementary.warranty}
                onChange={(e) => handleChange("warranty", e.target.value)}
              />
            }
          />

          <DataRow
            label="Status"
            data={
              <select
                className="bg-gray-700 text-amber-300 border border-amber-400 p-1 w-full"
                value={complementary.status}
                onChange={(e) => handleChange("status", e.target.value)}
              >
                <option value="">Select Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            }
          />

          {/* ARCHIVE SECTION END */}

          <DataRow
            label="Expected Lifespan (years)"
            data={
              <input
                type="number"
                className="bg-gray-700 text-amber-300 border border-amber-400 p-1 w-full"
                value={complementary.expected_lifespan}
                onChange={(e) =>
                  handleChange("expected_lifespan", e.target.value)
                }
              />
            }
          />

          <DataRow
            label="Depreciation Method"
            data={
              <select
                className="bg-gray-700 text-amber-300 border border-amber-400 p-1 w-full"
                value={complementary.depreciation_method}
                onChange={(e) =>
                  handleChange("depreciation_method", e.target.value)
                }
              >
                <option value="">Select Status</option>
                <option value="Straight-Line">Straight-Line</option>
                <option value="Double Decline">Double Decline</option>
              </select>
            }
          />

          <DataRow
            label="Annual Depreciation Rate (%)"
            data={
              <input
                type="number"
                className="bg-gray-700 text-amber-300 border border-amber-400 p-1 w-full"
                value={complementary.depreciation_rate}
                onChange={(e) =>
                  handleChange("depreciation_rate", e.target.value)
                }
              />
            }
          />

          <DataRow
            label="Notes"
            data={
              <textarea
                className="bg-gray-700 text-amber-300 border border-amber-400 p-1 w-full"
                rows={3}
                value={complementary.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
              />
            }
          />
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-amber-300 border-2 border-amber-400 font-bold transition-all"
          >
            CANCEL
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
  );
};

export default ComplementaryForm;
