import AssetPrintView from "@/components/AssetPrintView";
import DataRow from "@/components/DataRow";
import { useAuth } from "@/context/AuthContext";
import { assetAtom } from "@/context/jotai";
import { Asset, ComplementaryItem, ComponentItem } from "@/types";
import dayjs from "dayjs";
import { useAtomValue } from "jotai";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export const formatCurrency = (
  value: number,
  locale = "id-ID",
  currency = "IDR"
): string => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const AssetDetail = () => {
  const auth = useAuth();
  const router = useRouter();
  const asset = useAtomValue(assetAtom);
  const [selectedAsset, setSelectedAsset] = useState<Asset>();
  const [showComplementary, setShowComplementary] = useState(true);
  const [showComponents, setShowComponents] = useState(true);

  const { id: assetId } = router.query;

  const handleBack = () => {
    router.push("/catalog");
  };

  useEffect(() => {
    if (auth.loading) return;

    if (!auth.user) {
      router.replace("/");
      return;
    }

    if (!asset) {
      router.replace("/catalog");
      return;
    }

    const selected = asset.find((el) => el.id === assetId);
    if (!selected) {
      router.replace("/catalog");
      return;
    }

    setSelectedAsset({
      ...selected,
      current_book_value: calculateCurrentBookValue(selected),
    });
  }, [auth.loading, auth.user, assetId, asset]);

  const calculateCurrentBookValue = (selectedAsset: Asset) => {
    const activeDate = selectedAsset.active_date;
    const purcPrice = selectedAsset.purchase_price;
    const deprRate = selectedAsset.depreciation_rate;
    const monthCount = dayjs(new Date()).diff(activeDate, "month");
    const deprValue = Math.trunc(
      (deprRate / 100) * (monthCount / 12) * purcPrice
    );
    return purcPrice - deprValue;
  };

  const groupByPurchaseOrder = <T extends { archive: any[] }>(items: T[]) => {
    const grouped: Record<string, T[]> = {};

    items.forEach((item) => {
      item.archive?.forEach((archive) => {
        const poNumber = archive.purchase_order_number || "UNKNOWN_PO";
        if (!grouped[poNumber]) {
          grouped[poNumber] = [];
        }
        grouped[poNumber].push(item);
      });
    });

    return grouped;
  };

  const renderPurchaseHistory = (archive: any[]) => {
    if (!archive?.length)
      return <p className="text-amber-300">No purchase history available</p>;

    const grouped = archive.reduce((acc, item) => {
      const poNumber = item.purchase_order_number || "UNKNOWN PO";
      if (!acc[poNumber]) acc[poNumber] = [];
      acc[poNumber].push(item);
      return acc;
    }, {} as Record<string, typeof archive>);

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(grouped).map(
          ([poNumber, items]: [poNumber: string, items: any]) => (
            <div
              key={poNumber}
              className="border border-amber-400 rounded-lg p-4"
            >
              <h3 className="text-lg font-bold mb-3">PO Number: {poNumber}</h3>
              <div className="space-y-3">
                {items.map((item: any, index: any) => (
                  <div key={index} className="bg-gray-700 p-3 rounded">
                    <DataRow
                      label="Purchase Date"
                      data={dayjs(item.purchase_date).format("DD MMMM YYYY")}
                    />
                    <DataRow
                      label="Active Date"
                      data={dayjs(item.active_date).format("DD MMMM YYYY")}
                    />
                    <DataRow
                      label="Price"
                      data={formatCurrency(item.purchase_price)}
                    />
                    <DataRow label="Status" data={item.status} />
                    <DataRow label="Vendor" data={item.supplier_vendor} />
                    <DataRow label="Warranty" data={item.warranty || "-"} />
                    <DataRow
                      label="Serial Number"
                      data={item.serial_number || "-"}
                    />
                    <DataRow
                      label="Part Number"
                      data={item.part_number || "-"}
                    />
                    <DataRow
                      label="Notes"
                      data={item.notes || "-"}
                    />
                  </div>
                ))}
              </div>
            </div>
          )
        )}
      </div>
    );
  };

  const renderComplementaryItems = () => {
    if (!selectedAsset?.complementary_items?.length) {
      return <p className="text-amber-300">No complementary items</p>;
    }

    return (
      <div className="space-y-6">
        {selectedAsset.complementary_items.map((item, index) => (
          <div key={index} className="border-b border-amber-400 pb-6">
            <DataRow label="Complementary ID" data={item.complementary_id} />
            <DataRow label="Name" data={item.name} />
            <DataRow label="Brand" data={item.brand || "-"} />
            <DataRow label="Model" data={item.model || "-"} />
            <DataRow label="Notes" data={item.notes || "-"} />

            <div className="mt-4">
              <h4 className="font-bold mb-2">Purchase History:</h4>
              {renderPurchaseHistory(item.archive)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderComponentItems = () => {
    if (!selectedAsset?.component_items?.length) {
      return <p className="text-amber-300">No component items</p>;
    }

    return (
      <div className="space-y-6">
        {selectedAsset.component_items.map((item, index) => (
          <div key={index} className="border-b border-amber-400 pb-6">
            <DataRow label="Component ID" data={item.component_id} />
            <DataRow label="Name" data={item.name} />
            <DataRow label="Brand" data={item.brand} />
            <DataRow label="Model" data={item.model} />
            <DataRow label="Notes" data={item.notes || "-"} />

            <div className="mt-4">
              <h4 className="font-bold mb-2">Purchase History:</h4>
              {renderPurchaseHistory(item.archive)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-amber-300 p-4 font-mono">
      {auth.user && selectedAsset && (
        <div className="max-w-6xl mx-auto border-2 border-amber-400 bg-gray-800 p-6 shadow-lg shadow-amber-400/20">
          <div className="mb-6 border-b-2 border-amber-400 pb-4">
            <h1 className="text-3xl font-bold tracking-wider text-center">
              ASSET DETAILS
            </h1>
          </div>

          <div className="flex flex-col md:flex-row gap-8 mb-8">
            <div className="flex-1">
              <div className="flex justify-center mb-6 mt-2">
                <Image
                  src={selectedAsset.image_url}
                  alt={selectedAsset.id + " - " + selectedAsset.name}
                  height={500}
                  width={550}
                />
              </div>
            </div>

            <div className="flex-1">
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-3 border-b border-amber-400 pb-2">
                  TECHNICAL DETAILS
                </h2>
                <DataRow label="Asset ID" data={selectedAsset.id} />
                <DataRow label="Asset Name" data={selectedAsset.name} />
                <DataRow label="Brand" data={selectedAsset.brand || "-"} />
                <DataRow label="Model" data={selectedAsset.model || "-"} />
                <DataRow label="Category" data={selectedAsset.category} />
                <DataRow
                  label="Sub-Category"
                  data={selectedAsset.sub_category}
                />
                <DataRow
                  label="Serial Number"
                  data={selectedAsset.serial_number || "-"}
                />
                <DataRow
                  label="Part Number"
                  data={selectedAsset.part_number || "-"}
                />
                <DataRow
                  label="Owner Dept."
                  data={selectedAsset.department_owner}
                />
                <DataRow
                  label="Primary User"
                  data={selectedAsset.primary_user}
                />
                <DataRow
                  label="First Usage/Installation Date"
                  data={dayjs(selectedAsset.active_date).format("DD MMMM YYYY")}
                />
                <DataRow label="Status" data={selectedAsset.status} />
              </div>
            </div>
          </div>

          {auth.user.tagging === "0" && (
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-3 border-b border-amber-400 pb-2">
                FINANCIAL INFO
              </h2>
              <DataRow
                label="Purchase Date"
                data={dayjs(selectedAsset.purchase_date).format("DD MMMM YYYY")}
              />
              <DataRow
                label="Purchase Order Number"
                data={selectedAsset.purchase_order_number}
              />
              <DataRow label="Vendor" data={selectedAsset.vendor_supplier} />
              <DataRow label="Warranty" data={selectedAsset.warranty} />
              <DataRow
                label="Purchase Price"
                data={formatCurrency(selectedAsset.purchase_price)}
              />
              <DataRow
                label="Expected Lifespan"
                data={selectedAsset.expected_lifespan}
              />
              <DataRow
                label="Depreciation Method"
                data={selectedAsset.depreciation_method}
              />
              <DataRow
                label="Annual Depreciation Rate"
                data={selectedAsset.depreciation_rate + "%"}
              />
              <DataRow
                label="Current Book Value"
                data={formatCurrency(selectedAsset.current_book_value)}
              />
            </div>
          )}

          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-2xl font-bold border-b border-amber-400 pb-2">
                COMPLEMENTARY ASSETS
              </h2>
              <button
                onClick={() => setShowComplementary(!showComplementary)}
                className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-black font-bold rounded"
              >
                {showComplementary ? "Hide" : "Show"}
              </button>
            </div>
            {showComplementary && renderComplementaryItems()}
          </div>

          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-2xl font-bold border-b border-amber-400 pb-2">
                COMPONENT ITEMS
              </h2>
              <button
                onClick={() => setShowComponents(!showComponents)}
                className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-black font-bold rounded"
              >
                {showComponents ? "Hide" : "Show"}
              </button>
            </div>
            {showComponents && renderComponentItems()}
          </div>

          <div className="flex justify-between">
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-amber-700 hover:bg-amber-600 text-black border-2 border-amber-500 font-bold transition-all"
            >
              ← BACK
            </button>
            {auth.user.tagging === "0" && (
              <AssetPrintView asset={selectedAsset} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetDetail;