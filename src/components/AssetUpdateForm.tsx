import { useState } from "react";
import dayjs from "dayjs";
import { Asset } from "@/types";
import DataRow from "@/components/DataRow";

export interface AssetUpdateFormProps {
  asset: Asset;
  onSave: (updatedFields: {
    status: "Active" | "Inactive";
    active_date: Date;
    notes: string;
  }) => Promise<void>;
  onCancel: () => void;
}

const AssetUpdateForm = ({ asset, onSave, onCancel }: AssetUpdateFormProps) => {
  const [status, setStatus] = useState<"Active" | "Inactive">(asset.status);
  const [activeDate, setActiveDate] = useState<string>(
    dayjs(asset.active_date).format("YYYY-MM-DD")
  );
  const [notes, setNotes] = useState(asset.notes);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async () => {
    setIsSaving(true);
    await onSave({
      status,
      active_date: new Date(activeDate),
      notes,
    });
  };

  return (
    <div className="bg-gray-900 text-amber-300 p-4 font-mono">
      <div className="max-w-6xl mx-auto border-2 border-amber-400 bg-gray-800 p-6 shadow-lg shadow-amber-400/20">
        <div className="mb-6 border-b-2 border-amber-400 pb-4">
          <h1 className="text-3xl font-bold tracking-wider text-center">
            UPDATE ASSET'S STATE
          </h1>
        </div>

        <div className="mb-8">
          <DataRow label="Asset ID" data={asset.id} />
          <DataRow label="Asset Name" data={asset.name} />

          <DataRow
            label="Status"
            data={
              <select
                className="bg-gray-700 text-amber-300 border border-amber-400 p-1"
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as "Active" | "Inactive")
                }
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            }
          />

          <DataRow
            label="First Usage/Installation Date"
            data={
              <input
                type="date"
                className="bg-gray-700 text-amber-300 border border-amber-400 p-1"
                value={activeDate}
                onChange={(e) => setActiveDate(e.target.value)}
              />
            }
          />

          <DataRow
            label="Notes"
            data={
              <textarea
                className="bg-gray-700 text-amber-300 border border-amber-400 p-1 w-full"
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            }
          />
        </div>

        <div className="flex justify-between">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-amber-700 hover:bg-amber-600 text-black border-2 border-amber-500 font-bold transition-all"
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

export default AssetUpdateForm;
