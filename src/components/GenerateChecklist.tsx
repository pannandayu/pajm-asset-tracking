// pages/generate-checklist.tsx
import { useState } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import BendingMachineChecklistPDF from "./TesMaintenance";
import PrintChecklistButton from "./PrintChecklistButton";

const GenerateChecklistPage = () => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    technician: "Malik Ibrahim",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Generate Maintenance Checklist
        </h1>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Technician
          </label>
          <input
            type="text"
            name="technician"
            value={formData.technician}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>
    </div>
  );
};

export default GenerateChecklistPage;
