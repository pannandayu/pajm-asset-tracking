import AssetPrintView from "@/components/AssetPrintView";
import DataRow from "@/components/DataRow";
import { useAuth } from "@/context/AuthContext";
import { assetAtom } from "@/context/jotai";
import { Asset } from "@/types";
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

  const { id: assetId } = router.query;

  const handleBack = () => {
    router.push("/catalog");
  };

  useEffect(() => {
    if (auth.loading) return;

    if (!auth.user) {
      router.replace("/"); // Use replace instead of push
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

  return (
    <div className="min-h-screen bg-gray-900 text-amber-300 p-4 font-mono">
      {auth.user && selectedAsset && (
        <div className="max-w-6xl mx-auto border-2 border-amber-400 bg-gray-800 p-6 shadow-lg shadow-amber-400/20">
          <div className="mb-6 border-b-2 border-amber-400 pb-4">
            <h1 className="text-3xl font-bold tracking-wider text-center">
              ASSET DETAILS
            </h1>
          </div>

          {auth.user && auth.user.tagging === "0" ? (
            <div className="flex justify-center">
              <Image
                src={selectedAsset.image_url}
                alt={selectedAsset.id + " - " + selectedAsset.name}
                height={300}
                width={300}
              />
            </div>
          ) : (
            <Image
              src={selectedAsset.image_url}
              alt={selectedAsset.id + " - " + selectedAsset.name}
              height={300}
              width={300}
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 mt-4">
            <div>
              <h1 className="text-2xl font-bold mb-4 pb-2 border-b border-amber-400">
                TECHNICAL
              </h1>
              <DataRow label="Asset ID" data={selectedAsset.id} />
              <DataRow label="Asset Name" data={selectedAsset.name} />
              <DataRow label="Brand" data={selectedAsset.brand || "-"} />
              <DataRow label="Model" data={selectedAsset.model || "-"} />
              <DataRow label="Category" data={selectedAsset.category} />
              <DataRow label="Sub-Category" data={selectedAsset.sub_category} />
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
              <DataRow label="Primary User" data={selectedAsset.primary_user} />
              <DataRow
                label="First Usage/Installation Date"
                data={
                  dayjs(selectedAsset.active_date).format("DD MMMM YYYY") || "-"
                }
              />
              <DataRow label="Status" data={selectedAsset.status} />
            </div>
            {auth.user.tagging === "0" && (
              <div>
                <h1 className="text-2xl font-bold mb-4 pb-2 border-b border-amber-400">
                  FINANCIAL
                </h1>
                <DataRow
                  label="Purchase Date"
                  data={dayjs(selectedAsset.purchase_date).format(
                    "DD MMMM YYYY"
                  )}
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
