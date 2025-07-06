import React, { useRef } from "react";
import PrintableAsset from "./PrintableAsset";
import { Asset } from "@/types";

interface AssetPrintViewProps {
  asset: Asset;
}

const AssetPrintView = ({ asset }: AssetPrintViewProps) => {
  const [isPrintView, setIsPrintView] = React.useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  return (
    <div>
      {!isPrintView ? (
        <button
          onClick={() => setIsPrintView(true)}
          className="px-4 py-2 bg-amber-700 hover:bg-amber-600 text-black border-2 border-amber-500 font-bold transition-all"
        >
          PRINT
        </button>
      ) : (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-90 p-4 z-50 overflow-auto">
          <div className="max-w-6xl mx-auto bg-gray-800 border-2 border-amber-400 p-6 rounded-lg shadow-xl shadow-amber-400/20">
            <div className="flex justify-end mb-4"></div>
            <div ref={printRef}>
              <PrintableAsset
                asset={asset}
                onClose={() => setIsPrintView(false)}
                assetImageUrl={asset.image_url}
                companyLogoUrl="/logo-pajm.jpg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetPrintView;
