import { useAuth } from "@/context/AuthContext";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { Fragment, useEffect, useState } from "react";
import { Asset } from "@/types";
import { useAtom } from "jotai";
import { assetAtom } from "@/context/jotai";

export const groupAsset = (data: Asset[]) => {
  return data.reduce((acc, asset) => {
    const letter = asset.name[0].toUpperCase();
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(asset);
    return acc;
  }, {} as Record<string, Asset[]>);
};

const CatalogPage: NextPage = () => {
  const auth = useAuth();
  const router = useRouter();
  const [_, setAsset] = useAtom<Asset[] | null>(assetAtom);
  const [grouped, setGrouped] = useState<Record<string, Asset[]>>();
  const [sortedLetters, setSortedLetters] = useState<string[]>();

  const fetchAsset = async () => {
    try {
      const response = await fetch("/api/fetch-asset");
      const result = await response.json();

      if (result.message) {
        throw new Error(result.message);
      }

      setAsset(result);
      const g = groupAsset(result);
      setGrouped(g);
      setSortedLetters(Object.keys(g).sort());
    } catch (err: any) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (auth.loading) return;
    if (!auth.user) {
      router.push("/");
      return;
    }
    fetchAsset();
  }, [auth.loading, auth.user]);

  return (
    <div className="min-h-screen bg-gray-900 text-amber-300 font-mono lg:px-40 pt-4">
      {auth.user && (
        <Fragment>
          {/* Terminal Header */}
          <div className="bg-gray-800 border-2 border-amber-400 p-4 mb-6 shadow-lg shadow-amber-400/20">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
              <h1 className="text-2xl font-bold tracking-wider text-left">
                CATALOG MODULE
              </h1>
              <button
                className="bg-gray-700 hover:bg-gray-600 text-amber-300 border-2 border-amber-400 px-3 py-1 font-bold transition-all"
                onClick={() => router.push("/")}
              >
                ← TERMINAL
              </button>
            </div>
            <p className="text-amber-400 text-sm">
              DATABASE STATUS: OPERATIONAL
            </p>
          </div>

          {/* Catalog Content */}
          <div className="space-y-6">
            {sortedLetters && grouped ? (
              sortedLetters.map((letter) => (
                <div
                  key={letter}
                  id={`group-${letter}`}
                  className="bg-gray-800 border-2 border-amber-400 p-4 shadow-lg shadow-amber-400/10"
                >
                  {/* Letter Header */}
                  <h2 className="text-xl font-bold mb-3 border-b-2 border-amber-400 pb-1 inline-block">
                    {letter}
                  </h2>

                  {/* Asset List */}
                  <ul className="space-y-2">
                    {grouped[letter].map((asset) => (
                      <li
                        key={asset.id}
                        className="bg-gray-700 hover:bg-gray-600 border border-amber-400 p-3 cursor-pointer transition-all group"
                        onClick={() =>
                          router.push(
                            `${router.basePath}/catalog/detail?id=${asset.id}`
                          )
                        }
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                          <span className="font-bold text-amber-300 group-hover:text-amber-200">
                            {asset.name}
                          </span>
                          <div className="flex items-center gap-4 mt-1 sm:mt-0">
                            <span
                              className={`text-xs px-2 py-1 rounded-sm ${
                                asset.status === "Aktif"
                                  ? "bg-amber-800 text-amber-200"
                                  : asset.status === "Nonaktif"
                                  ? "bg-yellow-800 text-yellow-200"
                                  : "bg-red-800 text-red-200"
                              }`}
                            >
                              {asset.status.toUpperCase()}
                            </span>
                            <span className="text-xs opacity-70">
                              ID: {asset.id}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            ) : (
              <div className="bg-gray-800 border-2 border-amber-400 p-8 text-center">
                <h2 className="text-xl animate-pulse">
                  INITIALIZING DATABASE...
                </h2>
              </div>
            )}
          </div>

          {/* Terminal Footer */}
          <div className="bg-gray-800 border-2 border-amber-400 p-2 mt-6 text-center text-xs text-amber-400">
            PAJM SHIPYARD • CATALOG
          </div>
        </Fragment>
      )}
    </div>
  );
};

export default CatalogPage;
