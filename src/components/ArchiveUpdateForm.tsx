import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { Archive, Archive2 } from "@/types";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

interface ArchiveUpdateFormProps {
  itemType: "complementary" | "component";
  itemId: string;
  currentArchive: Archive[] | Archive2[];
  onClose: () => void;
  onUpdate: (updatedArchive: Archive[] | Archive2[]) => void;
}

const ArchiveUpdateForm = ({
  itemType,
  itemId,
  currentArchive,
  onClose,
  onUpdate,
}: ArchiveUpdateFormProps) => {
  const [archiveRecords, setArchiveRecords] = useState<(Archive | Archive2)[]>(
    currentArchive || []
  );
  const [activeRecordIndex, setActiveRecordIndex] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);

  const handleArchiveChange = (
    index: number,
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    const updated = [...archiveRecords];
    updated[index] = {
      ...updated[index],
      [name]: name === "purchase_price" ? Number(value) : value,
    };
    setArchiveRecords(updated);
  };

  const addNewArchiveRecord = () => {
    const newRecord: Archive | Archive2 =
      itemType === "complementary"
        ? {
            status: "Active",
            warranty: "",
            active_date: dayjs(new Date().toISOString()).format("YYYY-MM-DD"),
            purchase_date: dayjs(new Date().toISOString()).format("YYYY-MM-DD"),
            part_number: "",
            serial_number: "",
            purchase_price: 0,
            supplier_vendor: "",
            purchase_order_number: "",
            notes: "",
          }
        : {
            status: "Active",
            warranty: "",
            active_date: dayjs(new Date().toISOString()).format("YYYY-MM-DD"),
            purchase_date: dayjs(new Date().toISOString()).format("YYYY-MM-DD"),
            part_number: "",
            serial_number: "",
            purchase_price: 0,
            supplier_vendor: "",
            purchase_order_number: "",
            notes: "",
          };

    setArchiveRecords([...archiveRecords, newRecord]);
    setActiveRecordIndex(archiveRecords.length);
  };

  const removeArchiveRecord = (index: number) => {
    const updated = archiveRecords.filter((_, i) => i !== index);
    setArchiveRecords(updated);
    if (activeRecordIndex >= updated.length) {
      setActiveRecordIndex(updated.length - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    onUpdate(archiveRecords);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg border-2 border-amber-400 font-mono text-amber-300 w-full max-w-4xl max-h-[90vh] flex flex-col shadow-lg shadow-amber-400/20">
        <div className="flex justify-between items-center p-4 border-b border-amber-400 sticky top-0 bg-gray-800 z-10">
          <h2 className="text-xl font-bold tracking-wider">
            UPDATE {itemType.toUpperCase()} ARCHIVE - {itemId}
          </h2>
          <button
            onClick={onClose}
            className="text-amber-400 hover:text-amber-200 text-xl"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto p-4 flex-1">
          <form onSubmit={handleSubmit}>
            <div className="flex mb-4">
              <div className="w-1/4 pr-4 border-r border-amber-400">
                <h3 className="font-bold mb-2">Archive Records</h3>
                <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                  {archiveRecords.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setActiveRecordIndex(index)}
                      className={`w-full text-left p-2 rounded ${
                        activeRecordIndex === index
                          ? "bg-amber-600 text-black"
                          : "hover:bg-gray-700"
                      }`}
                    >
                      Record #{index + 1}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={addNewArchiveRecord}
                    className="w-full p-2 bg-amber-600 hover:bg-amber-500 text-black rounded text-sm mt-2"
                  >
                    + Add New Record
                  </button>
                </div>
              </div>

              <div className="w-3/4 pl-4">
                {archiveRecords.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm mb-1 font-bold">
                          STATUS:
                        </label>
                        <select
                          name="status"
                          value={archiveRecords[activeRecordIndex].status}
                          onChange={(e) =>
                            handleArchiveChange(activeRecordIndex, e)
                          }
                          className="w-full p-2 bg-gray-700 border-2 border-amber-400 rounded"
                          required
                        >
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
                          value={archiveRecords[activeRecordIndex].warranty}
                          onChange={(e) =>
                            handleArchiveChange(activeRecordIndex, e)
                          }
                          className="w-full p-2 bg-gray-700 border-2 border-amber-400 rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-1 font-bold">
                          ACTIVE DATE:
                        </label>
                        <input
                          type="date"
                          name="active_date"
                          value={
                            archiveRecords[activeRecordIndex].active_date.split(
                              "T"
                            )[0]
                          }
                          onChange={(e) =>
                            handleArchiveChange(activeRecordIndex, e)
                          }
                          className="w-full p-2 bg-gray-700 border-2 border-amber-400 rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-1 font-bold">
                          PURCHASE DATE:
                        </label>
                        <input
                          type="date"
                          name="purchase_date"
                          value={
                            archiveRecords[activeRecordIndex].purchase_date
                          }
                          onChange={(e) =>
                            handleArchiveChange(activeRecordIndex, e)
                          }
                          className="w-full p-2 bg-gray-700 border-2 border-amber-400 rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-1 font-bold">
                          PART NUMBER:
                        </label>
                        <input
                          type="text"
                          name="part_number"
                          value={archiveRecords[activeRecordIndex].part_number}
                          onChange={(e) =>
                            handleArchiveChange(activeRecordIndex, e)
                          }
                          className="w-full p-2 bg-gray-700 border-2 border-amber-400 rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-1 font-bold">
                          SERIAL NUMBER:
                        </label>
                        <input
                          type="text"
                          name="serial_number"
                          value={
                            archiveRecords[activeRecordIndex].serial_number
                          }
                          onChange={(e) =>
                            handleArchiveChange(activeRecordIndex, e)
                          }
                          className="w-full p-2 bg-gray-700 border-2 border-amber-400 rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-1 font-bold">
                          PURCHASE PRICE (Rp):
                        </label>
                        <input
                          type="number"
                          name="purchase_price"
                          value={
                            archiveRecords[activeRecordIndex].purchase_price
                          }
                          onChange={(e) =>
                            handleArchiveChange(activeRecordIndex, e)
                          }
                          className="w-full p-2 bg-gray-700 border-2 border-amber-400 rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-1 font-bold">
                          SUPPLIER/VENDOR:
                        </label>
                        <input
                          type="text"
                          name="supplier_vendor"
                          value={
                            archiveRecords[activeRecordIndex].supplier_vendor
                          }
                          onChange={(e) =>
                            handleArchiveChange(activeRecordIndex, e)
                          }
                          className="w-full p-2 bg-gray-700 border-2 border-amber-400 rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-1 font-bold">
                          PURCHASE ORDER NUMBER:
                        </label>
                        <input
                          type="text"
                          name="purchase_order_number"
                          value={
                            archiveRecords[activeRecordIndex]
                              .purchase_order_number
                          }
                          onChange={(e) =>
                            handleArchiveChange(activeRecordIndex, e)
                          }
                          className="w-full p-2 bg-gray-700 border-2 border-amber-400 rounded"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm mb-1 font-bold">
                        NOTES:
                      </label>
                      <textarea
                        name="notes"
                        value={archiveRecords[activeRecordIndex].notes}
                        onChange={(e) =>
                          handleArchiveChange(activeRecordIndex, e)
                        }
                        className="w-full p-2 bg-gray-700 border-2 border-amber-400 rounded"
                        rows={3}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      {archiveRecords.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArchiveRecord(activeRecordIndex)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-sm"
                        >
                          Remove This Record
                        </button>
                      )}
                      <div className="text-sm">
                        Record {activeRecordIndex + 1} of{" "}
                        {archiveRecords.length}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p>No archive records found</p>
                    <button
                      type="button"
                      onClick={addNewArchiveRecord}
                      className="mt-4 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-black rounded font-bold"
                    >
                      Create First Archive Record
                    </button>
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>

        <div className="p-4 border-t border-amber-400 sticky bottom-0 bg-gray-800">
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border-2 border-amber-400 rounded hover:bg-gray-700 text-amber-300 font-bold"
            >
              CANCEL
            </button>
            {archiveRecords.length > 0 && (
              <button
                type="submit"
                form="archive-form"
                className="px-4 py-2 bg-amber-600 text-black border-2 border-amber-500 rounded hover:bg-amber-500 font-bold"
                onClick={handleSubmit}
              >
                {isSaving ? "UPDATING..." : "UPDATE"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArchiveUpdateForm;
