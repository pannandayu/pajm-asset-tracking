import { formatCurrency } from "@/pages/catalog/detail";
import { Asset, ComplementaryItem, ComponentItem } from "@/types";
import dayjs from "dayjs";
import { PDFDocument, RGB, StandardFonts, rgb } from "pdf-lib";
import "dayjs/locale/id";


interface PrintableAssetProps {
  asset: Asset;
  onClose?: () => void;
  assetImageUrl: string;
  companyLogoUrl: string;
}

const PrintableAsset = ({
  asset,
  onClose,
  assetImageUrl,
  companyLogoUrl,
}: PrintableAssetProps) => {
  // Format archive records for display
  const formatArchiveRecords = (archive: any[]) => {
    return archive.map((record, index) => (
      <div key={index} className="mb-4 pl-4 border-l-2 border-amber-400">
        <h4 className="font-bold">Record #{index + 1}</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="font-semibold">Status:</span> {record.status}
          </div>
          <div>
            <span className="font-semibold">Warranty:</span> {record.warranty}
          </div>
          <div>
            <span className="font-semibold">Active Date:</span>{" "}
            {dayjs(record.active_date).format("DD MMMM YYYY")}
          </div>
          <div>
            <span className="font-semibold">Purchase Date:</span>{" "}
            {dayjs(record.purchase_date).format("DD MMMM YYYY")}
          </div>
          <div>
            <span className="font-semibold">Serial Number:</span>{" "}
            {record.serial_number}
          </div>
          <div>
            <span className="font-semibold">Part Number:</span>{" "}
            {record.part_number}
          </div>
          <div>
            <span className="font-semibold">Purchase Price:</span>{" "}
            {formatCurrency(record.purchase_price)}
          </div>
          <div>
            <span className="font-semibold">Vendor:</span>{" "}
            {record.supplier_vendor}
          </div>
          <div>
            <span className="font-semibold">PO Number:</span>{" "}
            {record.purchase_order_number}
          </div>
          <div className="col-span-2">
            <span className="font-semibold">Notes:</span> {record.notes}
          </div>
        </div>
      </div>
    ));
  };

  // Format components for display
  const formatComponents = (components: ComponentItem[]) => {
    return components.map((component, index) => (
      <div key={index} className="mb-4 pl-4 border-l-2 border-amber-400">
        <h4 className="font-bold">{component.name}</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="font-semibold">Brand:</span> {component.brand}
          </div>
          <div>
            <span className="font-semibold">Model:</span> {component.model}
          </div>
          <div>
            <span className="font-semibold">Relation:</span>{" "}
            {component.relation}
          </div>
          <div>
            <span className="font-semibold">Status:</span>{" "}
            {component.archive?.[0]?.status || "N/A"}
          </div>
          {component.archive && component.archive.length > 0 && (
            <div className="col-span-2">
              <h5 className="font-semibold mt-2">Archive Records:</h5>
              {formatArchiveRecords(component.archive)}
            </div>
          )}
        </div>
      </div>
    ));
  };

  // Format complementary items for display
  const formatComplementaryItems = (items: ComplementaryItem[]) => {
    return items.map((item, index) => (
      <div key={index} className="mb-4 pl-4 border-l-2 border-amber-400">
        <h4 className="font-bold">{item.name}</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="font-semibold">Brand:</span> {item.brand}
          </div>
          <div>
            <span className="font-semibold">Model:</span> {item.model}
          </div>
          <div>
            <span className="font-semibold">Category:</span> {item.category}
          </div>
          <div>
            <span className="font-semibold">Sub-Category:</span>{" "}
            {item.sub_category}
          </div>
          <div>
            <span className="font-semibold">Relation:</span> {item.relation}
          </div>
          <div>
            <span className="font-semibold">Status:</span>{" "}
            {item.archive?.[0]?.status || "N/A"}
          </div>
          {item.archive && item.archive.length > 0 && (
            <div className="col-span-2">
              <h5 className="font-semibold mt-2">Archive Records:</h5>
              {formatArchiveRecords(item.archive)}
            </div>
          )}
        </div>
      </div>
    ));
  };

  const technicalFields = [
    { label: "Asset ID", value: asset.id },
    { label: "Asset Name", value: asset.name },
    { label: "Brand", value: asset.brand || "-" },
    { label: "Model", value: asset.model || "-" },
    { label: "Category", value: asset.category },
    { label: "Sub-Category", value: asset.sub_category },
    { label: "Serial Number", value: asset.serial_number || "-" },
    { label: "Part Number", value: asset.part_number || "-" },
    { label: "Ownership (Dept.)", value: asset.department_owner },
    { label: "Primary User", value: asset.primary_user },
    {
      label: "First Usage/Installation Date",
      value: asset.active_date
        ? dayjs(asset.active_date).format("DD MMMM YYYY")
        : "-",
    },
    { label: "Status", value: asset.status },
  ];

  const financialFields = [
    {
      label: "Purchase Date",
      value: asset.purchase_date
        ? dayjs(asset.purchase_date).format("DD MMMM YYYY")
        : "-",
    },
    {
      label: "Purchase Order Number",
      value: asset.purchase_order_number || "-",
    },
    { label: "Vendor", value: asset.vendor_supplier || "-" },
    { label: "Warranty", value: asset.warranty || "-" },
    { label: "Purchase Price", value: formatCurrency(asset.purchase_price) },
    {
      label: "Expected Lifespan",
      value: `${asset.expected_lifespan || 0} years`,
    },
    { label: "Depreciation Method", value: asset.depreciation_method || "-" },
    {
      label: "Annual Depreciation Rate",
      value: `${asset.depreciation_rate || 0}%`,
    },
    {
      label: "Current Book Value",
      value: formatCurrency(asset.current_book_value),
    },
  ];

  return (
    <div className="p-6 bg-gray-800 border-2 border-amber-400 rounded-lg shadow-lg max-w-4xl mx-auto font-mono text-amber-300">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold tracking-wider border-b-2 border-amber-400 pb-2">
            PRINTABLE ASSET DETAILS
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
        <div>
          <div className="mb-4">
            <img
              src={assetImageUrl}
              alt="Asset"
              className="w-full max-h-48 object-contain border-2 border-amber-400"
            />
          </div>
          <h2 className="text-xl font-bold mb-4 pb-2 border-b border-amber-400">
            Technical Information
          </h2>
          <div className="space-y-3">
            {technicalFields.map((field) => (
              <div
                key={field.label}
                className="flex justify-between gap-4 text-sm"
              >
                <span className="font-bold">{field.label}: </span>
                <span className="text-right">{field.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4 pb-2 border-b border-amber-400">
            Financial Information
          </h2>
          <div className="space-y-3">
            {financialFields.map((field) => (
              <div
                key={field.label}
                className="flex justify-between gap-4 text-sm"
              >
                <span className="font-bold">{field.label}: </span>
                <span className="text-right">{field.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Components Section */}
        {asset.component_items && asset.component_items.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4 pb-2 border-b border-amber-400">
              Components ({asset.component_items.length})
            </h2>
            <div className="space-y-4">
              {formatComponents(asset.component_items)}
            </div>
          </div>
        )}

        {/* Complementary Items Section */}
        {asset.complementary_items && asset.complementary_items.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4 pb-2 border-b border-amber-400">
              Complementary Assets ({asset.complementary_items.length})
            </h2>
            <div className="space-y-4">
              {formatComplementaryItems(asset.complementary_items)}
            </div>
          </div>
        )}
      </div>

      <div className="my-8 text-sm text-amber-400">
        <p>Document generated on: {dayjs().format("DD MMMM YYYY HH:mm")}</p>
      </div>

      <div className="flex gap-2">
        {/* <button
          onClick={generatePdf}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-black border-2 border-amber-500 font-bold transition-all"
        >
          Download PDF
        </button> */}
        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-amber-300 border-2 border-amber-400 font-bold transition-all"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
};

export default PrintableAsset;
