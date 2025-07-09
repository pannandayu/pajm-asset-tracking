// Create a new component components/PrintChecklistButton.tsx
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import BendingMachineChecklistPDF from "./TesMaintenance";

interface PrintChecklistButtonProps {
  data: {
    date: string;
    technician: string;
  };
}

const PrintChecklistButton: React.FC<PrintChecklistButtonProps> = ({
  data,
}) => {
  const componentRef = useRef(null);

  const handlePrint = useReactToPrint({
    // content: () => componentRef.current,
    pageStyle: `
      @page {
        size: A4;
        margin: 20mm;
      }
    `,
  });

  return (
    <>
      <button
        onClick={handlePrint}
        className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200 ml-4"
      >
        Print Checklist
      </button>

      <div style={{ display: "none" }}>
        <div ref={componentRef}>
          <BendingMachineChecklistPDF data={data} />
        </div>
      </div>
    </>
  );
};

export default PrintChecklistButton;
