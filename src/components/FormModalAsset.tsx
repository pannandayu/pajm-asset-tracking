import { useAuth } from "@/context/AuthContext";
import { Asset, Complementary, Component } from "@/types";
import dayjs from "dayjs";
import { ChangeEvent, FormEvent, useState } from "react";

const AssetModal = ({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: () => void;
}) => {
  const auth = useAuth();
  const [activeTab, setActiveTab] = useState<
    "main" | "complementary" | "components"
  >("main");
  const [isSaving, setIsSaving] = useState<boolean | null | undefined>();

  // Main asset form state - fully typed with all Asset fields
  const [formData, setFormData] = useState<Asset>({
    id: "",
    name: "",
    brand: "",
    model: "",
    serial_number: "",
    part_number: "",
    category: "",
    sub_category: "",
    department_owner: "",
    purchase_price: 0,
    purchase_order_number: "",
    vendor_supplier: "",
    expected_lifespan: 0,
    depreciation_method: "",
    current_book_value: 0,
    purchase_date: new Date(),
    depreciation_rate: 0,
    status: "Inactive",
    warranty: "",
    active_date: new Date(),
    image_url: "",
    primary_user: "",
    notes: "",
  });

  // Complementary assets - fully typed with Complementary interface
  const [complementaryAssets, setComplementaryAssets] = useState<
    Complementary[]
  >([]);

  // Components - using Partial<Asset> but with required fields enforced
  const [components, setComponents] = useState<Array<Component>>([]);

  // Handle main asset form changes
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "purchase_price" ||
        name === "expected_lifespan" ||
        name === "depreciation_rate" ||
        name === "current_book_value"
          ? Number(value)
          : value,
    }));
  };

  // Handle complementary asset changes
  const handleComplementaryChange = (
    index: number,
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const updated = [...complementaryAssets];
    updated[index] = {
      ...updated[index],
      [name]:
        name === "expected_lifespan" || name === "depreciation_rate"
          ? Number(value)
          : value,
    };
    setComplementaryAssets(updated);
  };

  // Handle component changes
  const handleComponentChange = (
    index: number,
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const updated = [...components];
    updated[index] = {
      ...updated[index],
      [name]:
        name === "purchase_price" || name === "expected_lifespan"
          ? Number(value)
          : value,
    };
    setComponents(updated);
  };

  // Add new complementary asset with all required fields
  const addComplementaryAsset = () => {
    setComplementaryAssets([
      ...complementaryAssets,
      {
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
        purchase_date: new Date(),
        status: "",
        warranty: "",
        active_date: new Date(),
        expected_lifespan: 0,
        depreciation_method: "",
        depreciation_rate: 0,
        notes: "",
      },
    ]);
  };

  // Add new component with required fields
  const addComponent = () => {
    setComponents([
      ...components,
      {
        id: "",
        name: "",
        brand: "",
        model: "",
        serial_number: "",
        part_number: "",
        supplier_vendor: "",
        purchase_price: 0,
        purchase_order_number: "",
        purchase_date: new Date(),
        status: "",
        warranty: "",
        active_date: new Date(),
        expected_lifespan: 0,
        // depreciation_method: "",
        // depreciation_rate: number;
        notes: "",
      },
    ]);
  };

  const removeComplementaryAsset = (index: number) => {
    setComplementaryAssets(complementaryAssets.filter((_, i) => i !== index));
  };

  const removeComponent = (index: number) => {
    setComponents(components.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setIsSaving(null);

    // console.log({
    //   mainAsset: formData,
    //   complementaryAssets,
    //   components,
    // });

    try {
      const response = await fetch("/api/post-asset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mainAsset: formData,
          complementaryAssets,
          components,
        }),
      });

      if (response.ok) {
        onSubmit();
        onClose();
      } else {
        console.error("Failed to submit asset");
        setIsSaving(false);
      }
    } catch (error) {
      console.error("Error submitting asset:", error);
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg border-2 border-amber-400 font-mono text-amber-300 w-full max-w-4xl max-h-[90vh] flex flex-col shadow-lg shadow-amber-400/20">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b border-amber-400 sticky top-0 bg-gray-800 z-10">
          <h2 className="text-xl font-bold tracking-wider">RECORD NEW ASSET</h2>
          <button
            onClick={onClose}
            className="text-amber-400 hover:text-amber-200 text-xl"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-amber-400">
          <button
            type="button"
            className={`px-4 py-2 font-bold ${
              activeTab === "main"
                ? "bg-amber-600 text-black"
                : "hover:bg-gray-700"
            }`}
            onClick={() => setActiveTab("main")}
          >
            MAIN ASSET
          </button>
          <button
            type="button"
            className={`px-4 py-2 font-bold ${
              activeTab === "complementary"
                ? "bg-amber-600 text-black"
                : "hover:bg-gray-700"
            }`}
            onClick={() => setActiveTab("complementary")}
          >
            COMPLEMENTARY ({complementaryAssets.length})
          </button>
          <button
            type="button"
            className={`px-4 py-2 font-bold ${
              activeTab === "components"
                ? "bg-amber-600 text-black"
                : "hover:bg-gray-700"
            }`}
            onClick={() => setActiveTab("components")}
          >
            COMPONENTS ({components.length})
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-4 flex-1">
          <form onSubmit={handleSubmit} id="asset-form">
            {/* Main Asset Tab */}
            {activeTab === "main" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Basic Information */}
                  <div>
                    <label className="block text-sm mb-1 font-bold">
                      ASSET ID:
                    </label>
                    <input
                      type="text"
                      name="id"
                      value={formData.id}
                      onChange={handleChange}
                      className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1 font-bold">
                      ASSET NAME:
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1 font-bold">
                      BRAND:
                    </label>
                    <input
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleChange}
                      className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1 font-bold">
                      MODEL:
                    </label>
                    <input
                      type="text"
                      name="model"
                      value={formData.model}
                      onChange={handleChange}
                      className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1 font-bold">
                      CATEGORY:
                    </label>
                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1 font-bold">
                      SUB-CATEGORY:
                    </label>
                    <input
                      type="text"
                      name="sub_category"
                      value={formData.sub_category}
                      onChange={handleChange}
                      className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded"
                      required
                    />
                  </div>

                  {/* Financial Information */}
                  <div>
                    <label className="block text-sm mb-1 font-bold">
                      PURCHASE PRICE (Rp):
                    </label>
                    <input
                      type="number"
                      name="purchase_price"
                      value={formData.purchase_price}
                      onChange={handleChange}
                      className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1 font-bold">
                      PURCHASE DATE:
                    </label>
                    <input
                      type="date"
                      name="purchase_date"
                      value={dayjs(formData.purchase_date).format("YYYY-MM-DD")}
                      onChange={handleChange}
                      className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1 font-bold">
                      Ownership (Dept.)
                    </label>
                    <input
                      type="text"
                      name="department_owner"
                      value={formData.department_owner}
                      onChange={handleChange}
                      className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1 font-bold">
                      PRIMARY USER
                    </label>
                    <input
                      type="text"
                      name="primary_user"
                      value={formData.primary_user}
                      onChange={handleChange}
                      className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1 font-bold">
                      DEPRECIATION METHOD:
                    </label>
                    <select
                      name="depreciation_method"
                      value={formData.depreciation_method}
                      onChange={handleChange}
                      className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded"
                    >
                      <option value="">Select Method</option>
                      <option value="Straight-Line">Straight-Line</option>
                      <option value="Declining Balance">
                        Declining Balance
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm mb-1 font-bold">
                      DEPRECIATION RATE (%):
                    </label>
                    <input
                      type="number"
                      name="depreciation_rate"
                      value={formData.depreciation_rate}
                      onChange={handleChange}
                      className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded"
                    />
                  </div>

                  {/* Additional Details */}
                  <div>
                    <label className="block text-sm mb-1 font-bold">
                      SERIAL NUMBER:
                    </label>
                    <input
                      type="text"
                      name="serial_number"
                      value={formData.serial_number}
                      onChange={handleChange}
                      className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1 font-bold">
                      PART NUMBER:
                    </label>
                    <input
                      type="text"
                      name="part_number"
                      value={formData.part_number}
                      onChange={handleChange}
                      className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1 font-bold">
                      VENDOR/SUPPLIER:
                    </label>
                    <input
                      type="text"
                      name="vendor_supplier"
                      value={formData.vendor_supplier}
                      onChange={handleChange}
                      className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1 font-bold">
                      PURCHASE ORDER NUMBER:
                    </label>
                    <input
                      type="text"
                      name="purchase_order_number"
                      value={formData.purchase_order_number}
                      onChange={handleChange}
                      className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded"
                    />
                  </div>

                  {/* Status and Dates */}
                  <div>
                    <label className="block text-sm mb-1 font-bold">
                      STATUS:
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded"
                      required
                    >
                      <option value="">Select Status</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm mb-1 font-bold">
                      ACTIVE DATE:
                    </label>
                    <input
                      type="date"
                      name="active_date"
                      value={dayjs(formData.active_date).format("YYYY-MM-DD")}
                      onChange={handleChange}
                      className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1 font-bold">
                      EXPECTED LIFESPAN (years):
                    </label>
                    <input
                      type="number"
                      name="expected_lifespan"
                      value={formData.expected_lifespan}
                      onChange={handleChange}
                      className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1 font-bold">
                      WARRANTY:
                    </label>
                    <input
                      type="text"
                      name="warranty"
                      value={formData.warranty}
                      onChange={handleChange}
                      className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded"
                    />
                  </div>

                  {/* Notes and Additional Info */}
                </div>
                <div>
                  <label className="block text-sm mb-1 font-bold">NOTES:</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded"
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* Complementary Assets Tab */}
            {activeTab === "complementary" && (
              <div className="space-y-4">
                {complementaryAssets.map((asset, index) => (
                  <div
                    key={index}
                    className="border-2 border-amber-400 p-4 rounded-lg mb-4"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold">
                        COMPLEMENTARY ASSET #{index + 1}
                      </h3>
                      {complementaryAssets.length >= 1 && (
                        <button
                          type="button"
                          onClick={() => removeComplementaryAsset(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm mb-1 font-bold">
                          ID:
                        </label>
                        <input
                          type="text"
                          name="id"
                          value={asset.id}
                          onChange={(e) => handleComplementaryChange(index, e)}
                          className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-1 font-bold">
                          NAME:
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={asset.name}
                          onChange={(e) => handleComplementaryChange(index, e)}
                          className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-1 font-bold">
                          BRAND:
                        </label>
                        <input
                          type="text"
                          name="brand"
                          value={asset.brand}
                          onChange={(e) => handleComplementaryChange(index, e)}
                          className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-1 font-bold">
                          MODEL:
                        </label>
                        <input
                          type="text"
                          name="model"
                          value={asset.model}
                          onChange={(e) => handleComplementaryChange(index, e)}
                          className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-1 font-bold">
                          CATEGORY:
                        </label>
                        <input
                          type="text"
                          name="category"
                          value={asset.category}
                          onChange={(e) => handleComplementaryChange(index, e)}
                          className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-1 font-bold">
                          SUB-CATEGORY:
                        </label>
                        <input
                          type="text"
                          name="sub_category"
                          value={asset.sub_category}
                          onChange={(e) => handleComplementaryChange(index, e)}
                          className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-1 font-bold">
                          DEPARTMENT OWNER:
                        </label>
                        <input
                          type="text"
                          name="department_owner"
                          value={asset.department_owner}
                          onChange={(e) => handleComplementaryChange(index, e)}
                          className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-1 font-bold">
                          SERIAL NUMBER:
                        </label>
                        <input
                          type="text"
                          name="serial_number"
                          value={asset.serial_number}
                          onChange={(e) => handleComplementaryChange(index, e)}
                          className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-1 font-bold">
                          PART NUMBER:
                        </label>
                        <input
                          type="text"
                          name="part_number"
                          value={asset.part_number}
                          onChange={(e) => handleComplementaryChange(index, e)}
                          className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-1 font-bold">
                          SUPPLIER / VENDOR:
                        </label>
                        <input
                          type="text"
                          name="supplier_vendor"
                          value={asset.supplier_vendor}
                          onChange={(e) => handleComplementaryChange(index, e)}
                          className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-1 font-bold">
                          PURCHASE PRICE (Rp.)
                        </label>
                        <input
                          type="number"
                          name="purchase_price"
                          value={asset.purchase_price}
                          onChange={(e) => handleComplementaryChange(index, e)}
                          className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-1 font-bold">
                          PURCHASE ORDER NUMBER:
                        </label>
                        <input
                          type="text"
                          name="purchase_order_number"
                          value={asset.purchase_order_number}
                          onChange={(e) => handleComplementaryChange(index, e)}
                          className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded"
                        />
                      </div>

                      <div>
                        <label className="block text-sm mb-1 font-bold">
                          PURCHASE DATE:
                        </label>
                        <input
                          type="date"
                          name="purchase_date"
                          value={dayjs(asset.purchase_date).format(
                            "YYYY-MM-DD"
                          )}
                          onChange={(e) => handleComplementaryChange(index, e)}
                          className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-1 font-bold">
                          ACTIVE DATE:
                        </label>
                        <input
                          type="date"
                          name="active_date"
                          value={dayjs(asset.active_date).format("YYYY-MM-DD")}
                          onChange={(e) => handleComplementaryChange(index, e)}
                          className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-1 font-bold">
                          STATUS:
                        </label>
                        <select
                          name="status"
                          value={asset.status}
                          onChange={(e) => handleComplementaryChange(index, e)}
                          className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded"
                          required
                        >
                          <option value="">Select Status</option>
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm mb-1 font-bold">
                          WARRANTY:
                        </label>
                        <input
                          type="text"
                          name="warranty"
                          value={asset.warranty}
                          onChange={(e) => handleComplementaryChange(index, e)}
                          className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-1 font-bold">
                          EXPECTED LIFESPAN (years):
                        </label>
                        <input
                          type="number"
                          name="expected_lifespan"
                          value={asset.expected_lifespan}
                          onChange={(e) => handleComplementaryChange(index, e)}
                          className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-1 font-bold">
                          DEPRECIATION METHOD:
                        </label>
                        <select
                          name="depreciation_method"
                          value={asset.depreciation_method}
                          onChange={(e) => handleComplementaryChange(index, e)}
                          className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded"
                        >
                          <option value="">Select Method</option>
                          <option value="Straight-Line">Straight-Line</option>
                          <option value="Declining Balance">
                            Declining Balance
                          </option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm mb-1 font-bold">
                          DEPRECIATION RATE (%):
                        </label>
                        <input
                          type="number"
                          name="depreciation_rate"
                          value={asset.depreciation_rate}
                          onChange={(e) => handleComplementaryChange(index, e)}
                          className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm mb-1 font-bold">
                        NOTES:
                      </label>
                      <textarea
                        name="notes"
                        value={asset.notes}
                        onChange={(e) => handleComplementaryChange(index, e)}
                        className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded"
                        rows={2}
                      />
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addComplementaryAsset}
                  className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-black font-bold rounded text-sm"
                >
                  + Add Complementary Asset
                </button>
              </div>
            )}

            {/* Components Tab */}
            {activeTab === "components" && (
              <div className="space-y-4">
                {components.map((component, index) => (
                  <div
                    key={index}
                    className="border-2 border-amber-400 p-4 rounded-lg mb-4"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold">COMPONENT #{index + 1}</h3>
                      {components.length >= 1 && (
                        <button
                          type="button"
                          onClick={() => removeComponent(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm mb-1 font-bold">
                          ID:
                        </label>
                        <input
                          type="text"
                          name="id"
                          value={component.id}
                          onChange={(e) => handleComponentChange(index, e)}
                          className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-1 font-bold">
                          NAME:
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={component.name}
                          onChange={(e) => handleComponentChange(index, e)}
                          className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-1 font-bold">
                          BRAND:
                        </label>
                        <input
                          type="text"
                          name="brand"
                          value={component.brand}
                          onChange={(e) => handleComponentChange(index, e)}
                          className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-1 font-bold">
                          MODEL:
                        </label>
                        <input
                          type="text"
                          name="model"
                          value={component.model}
                          onChange={(e) => handleComponentChange(index, e)}
                          className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded"
                        />
                      </div>
                      {/* <div>
                        <label className="block text-sm mb-1 font-bold">
                          CATEGORY:
                        </label>
                        <input
                          type="text"
                          name="category"
                          value={component.category}
                          onChange={(e) => handleComponentChange(index, e)}
                          className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded"
                          required
                        />
                      </div> */}
                      {/* <div>
                        <label className="block text-sm mb-1 font-bold">
                          TYPE:
                        </label>
                        <input
                          type="text"
                          name="sub_category"
                          value={component.sub_category}
                          onChange={(e) => handleComponentChange(index, e)}
                          className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded"
                          required
                        />
                      </div> */}

                      <div>
                        <label className="block text-sm mb-1 font-bold">
                          SERIAL NUMBER:
                        </label>
                        <input
                          type="text"
                          name="serial_number"
                          value={component.serial_number}
                          onChange={(e) => handleComponentChange(index, e)}
                          className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-1 font-bold">
                          PART NUMBER:
                        </label>
                        <input
                          type="text"
                          name="part_number"
                          value={component.part_number}
                          onChange={(e) => handleComponentChange(index, e)}
                          className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-1 font-bold">
                          SUPPLIER / VENDOR:
                        </label>
                        <input
                          type="text"
                          name="supplier_vendor"
                          value={component.supplier_vendor}
                          onChange={(e) => handleComponentChange(index, e)}
                          className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-1 font-bold">
                          PURCHASE PRICE (Rp.)
                        </label>
                        <input
                          type="number"
                          name="purchase_price"
                          value={component.purchase_price}
                          onChange={(e) => handleComponentChange(index, e)}
                          className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-1 font-bold">
                          PURCHASE ORDER NUMBER:
                        </label>
                        <input
                          type="text"
                          name="purchase_order_number"
                          value={component.purchase_order_number}
                          onChange={(e) => handleComponentChange(index, e)}
                          className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded"
                        />
                      </div>

                      <div>
                        <label className="block text-sm mb-1 font-bold">
                          PURCHASE DATE:
                        </label>
                        <input
                          type="date"
                          name="purchase_date"
                          value={dayjs(component.purchase_date).format(
                            "YYYY-MM-DD"
                          )}
                          onChange={(e) => handleComponentChange(index, e)}
                          className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-1 font-bold">
                          ACTIVE DATE:
                        </label>
                        <input
                          type="date"
                          name="active_date"
                          value={dayjs(component.active_date).format(
                            "YYYY-MM-DD"
                          )}
                          onChange={(e) => handleComponentChange(index, e)}
                          className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-1 font-bold">
                          STATUS:
                        </label>
                        <select
                          name="status"
                          value={component.status}
                          onChange={(e) => handleComponentChange(index, e)}
                          className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded"
                          required
                        >
                          <option value="">Select Status</option>
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm mb-1 font-bold">
                          WARRANTY:
                        </label>
                        <input
                          type="text"
                          name="warranty"
                          value={component.warranty}
                          onChange={(e) => handleComponentChange(index, e)}
                          className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded"
                        />
                      </div>

                      <div>
                        <label className="block text-sm mb-1 font-bold">
                          EXPECTED LIFESPAN (years):
                        </label>
                        <input
                          type="number"
                          name="expected_lifespan"
                          value={component.expected_lifespan}
                          onChange={(e) => handleComponentChange(index, e)}
                          className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm mb-1 font-bold">
                        NOTES:
                      </label>
                      <textarea
                        name="notes"
                        value={component.notes}
                        onChange={(e) => handleComponentChange(index, e)}
                        className="w-full p-2 bg-gray-900 border-2 border-amber-400 rounded"
                        rows={2}
                      />
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addComponent}
                  className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-black font-bold rounded text-sm"
                >
                  + Add Component
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Sticky Footer */}
        <div className="p-4 border-t border-amber-400 sticky bottom-0 bg-gray-800">
          <div className="flex justify-between items-center">
            <div className="text-sm">
              {activeTab === "main" && "Main Asset Details"}
              {activeTab === "complementary" &&
                `${complementaryAssets.length} Complementary Assets`}
              {activeTab === "components" && `${components.length} Components`}
            </div>
            {isSaving === false && <p>SAVING ASSET FAILED. TRY AGAIN LATER.</p>}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border-2 border-amber-400 rounded hover:bg-gray-700 text-amber-300 font-bold"
              >
                CANCEL
              </button>
              <button
                type="submit"
                form="asset-form"
                className="px-4 py-2 bg-amber-600 text-black border-2 border-amber-500 rounded hover:bg-amber-500 font-bold"
              >
                {isSaving === null ? "SAVING..." : "SAVE ASSET"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetModal;
