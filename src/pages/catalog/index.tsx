import { useAuth } from "@/context/AuthContext";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { Fragment, useEffect, useState } from "react";
import { Asset } from "@/types";
import { useAtom } from "jotai";
import { assetAtom } from "@/context/jotai";
import AssetModal from "@/components/FormModalAsset";
import {
  MdViewModule,
  MdViewList,
  MdGridOn,
  MdDashboard,
  MdSearch,
  MdFilterList,
  MdSort,
  MdInfo,
  MdRefresh,
  MdViewQuilt,
  MdViewCarousel,
} from "react-icons/md";
import { CiDatabase } from "react-icons/ci";

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
  const [assetModal, setAssetModal] = useState(false);
  const [viewMode, setViewMode] = useState<
    "list" | "grid" | "card" | "minimal" | "panel"
  >("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "Active" | "Inactive" | "Maintenance"
  >("all");
  const [sortBy, setSortBy] = useState<"name" | "id" | "status">("id");
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAsset = async () => {
    try {
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
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

  // Filter and sort assets based on user selections
  const filteredAndSortedAssets = () => {
    if (!grouped) return {};

    const result: Record<string, Asset[]> = {};

    Object.keys(grouped).forEach((letter) => {
      let assets = grouped[letter];

      // Apply search filter
      if (searchTerm) {
        assets = assets.filter(
          (asset) =>
            asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            asset.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Apply status filter
      if (statusFilter !== "all") {
        assets = assets.filter((asset) => asset.status === statusFilter);
      }

      // Apply sorting
      assets = [...assets].sort((a, b) => {
        if (sortBy === "name") return a.name.localeCompare(b.name);
        if (sortBy === "id") return a.id.localeCompare(b.id);
        return a.status.localeCompare(b.status);
      });

      if (assets.length > 0) {
        result[letter] = assets;
      }
    });

    return result;
  };

  const filteredGroups = filteredAndSortedAssets();
  const filteredLetters = Object.keys(filteredGroups).sort();

  const toggleGroup = (letter: string) => {
    if (expandedGroup === letter) {
      setExpandedGroup(null);
    } else {
      setExpandedGroup(letter);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-900 text-green-300";
      case "Inactive":
        return "bg-yellow-900 text-yellow-300";
      case "Maintenance":
        return "bg-red-900 text-red-300";
      default:
        return "bg-gray-900 text-gray-300";
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-amber-300 font-mono px-4 lg:px-8 pt-4 pb-8">
      {auth.user && (
        <Fragment>
          {/* Terminal Header */}
          <div className="bg-gray-800 border-2 border-amber-400 p-4 mb-6 rounded-lg shadow-lg shadow-amber-400/10">
            <div className="flex flex-col gap-4 sm:flex-row justify-between items-start sm:items-center mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-400 rounded-lg">
                  <MdViewModule className="text-2xl text-gray-900" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-wider">
                    CATALOG MODULE
                  </h1>
                  <p className="text-amber-400/70 text-sm flex items-center gap-1">
                    <CiDatabase className="inline" /> ASSET MANAGEMENT SYSTEM
                  </p>
                </div>
              </div>

              <button
                className="bg-gray-700 hover:bg-amber-500 hover:text-gray-900 text-amber-300 border-2 border-amber-400 px-4 py-2 font-bold transition-all rounded-lg flex items-center gap-2"
                onClick={() => router.push("/")}
              >
                <span>← TERMINAL</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Search Box */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MdSearch className="text-amber-400/70" />
                </div>
                <input
                  type="text"
                  placeholder="Search assets..."
                  className="w-full bg-gray-700 border-2 border-amber-400/30 rounded-lg pl-10 pr-4 py-2 text-amber-300 focus:outline-none focus:border-amber-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Filter Dropdown */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MdFilterList className="text-amber-400/70" />
                </div>
                <select
                  className="w-full bg-gray-700 border-2 border-amber-400/30 rounded-lg pl-10 pr-4 py-2 text-amber-300 focus:outline-none focus:border-amber-400 appearance-none"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                >
                  <option value="all">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MdSort className="text-amber-400/70" />
                </div>
                <select
                  className="w-full bg-gray-700 border-2 border-amber-400/30 rounded-lg pl-10 pr-4 py-2 text-amber-300 focus:outline-none focus:border-amber-400 appearance-none"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                >
                  <option value="name">Sort by Name</option>
                  <option value="id">Sort by ID</option>
                  <option value="status">Sort by Status</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-amber-400/70 text-sm">View:</span>
                <div className="flex bg-gray-700 rounded-lg p-1">
                  <button
                    className={`p-2 rounded-md ${
                      viewMode === "list"
                        ? "bg-amber-400 text-gray-900"
                        : "text-amber-300"
                    }`}
                    onClick={() => setViewMode("list")}
                    title="List View"
                  >
                    <MdViewList className="text-xl" />
                  </button>
                  <button
                    className={`p-2 rounded-md ${
                      viewMode === "grid"
                        ? "bg-amber-400 text-gray-900"
                        : "text-amber-300"
                    }`}
                    onClick={() => setViewMode("grid")}
                    title="Grid View"
                  >
                    <MdGridOn className="text-xl" />
                  </button>
                  <button
                    className={`p-2 rounded-md ${
                      viewMode === "minimal"
                        ? "bg-amber-400 text-gray-900"
                        : "text-amber-300"
                    }`}
                    onClick={() => setViewMode("minimal")}
                    title="Minimal View"
                  >
                    <MdViewCarousel className="text-xl" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={fetchAsset}
                  className="flex items-center gap-2 bg-gray-700 hover:bg-amber-500 hover:text-gray-900 text-amber-300 border-2 border-amber-400/30 px-3 py-1 rounded-lg transition-all"
                  title="Refresh Data"
                >
                  <MdRefresh className="text-lg" />
                  <span className="text-sm">REFRESH</span>
                </button>

                {auth.user.tagging !== "2" && (
                  <button
                    onClick={() => setAssetModal(true)}
                    className="bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold py-2 px-4 border-b-4 border-amber-600 hover:border-amber-500 rounded-lg transition-all text-sm flex items-center gap-2"
                  >
                    <span>+ NEW ASSET</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="bg-gray-800 border-2 border-amber-400/30 rounded-lg p-3 mb-6 grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-400">
                {grouped ? Object.values(grouped).flat().length : 0}
              </div>
              <div className="text-xs text-amber-400/70">TOTAL ASSETS</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {grouped
                  ? Object.values(grouped)
                      .flat()
                      .filter((a) => a.status === "Active").length
                  : 0}
              </div>
              <div className="text-xs text-amber-400/70">ACTIVE</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-400">
                {filteredLetters ? filteredLetters.length : 0}
              </div>
              <div className="text-xs text-amber-400/70">FILTERED</div>
            </div>
          </div>

          {/* Catalog Content */}
          {isLoading ? (
            <div className="bg-gray-800 border-2 border-amber-400 rounded-lg p-8 text-center">
              <h2 className="text-xl animate-pulse flex items-center justify-center gap-2">
                <MdRefresh className="animate-spin" /> INITIALIZING DATABASE...
              </h2>
            </div>
          ) : filteredLetters && filteredLetters.length > 0 ? (
            <div className="space-y-6">
              {filteredLetters.map((letter) => (
                <div
                  key={letter}
                  id={`group-${letter}`}
                  className="bg-gray-800 border-2 border-amber-400 rounded-lg p-4 shadow-lg shadow-amber-400/10"
                >
                  {/* Letter Header */}
                  <div
                    className="flex justify-between items-center cursor-pointer mb-3"
                    onClick={() => toggleGroup(letter)}
                  >
                    <h2 className="text-xl font-bold border-b-2 border-amber-400 pb-1 inline-block">
                      {letter}{" "}
                      <span className="text-amber-400/70 text-sm">
                        ({filteredGroups[letter].length})
                      </span>
                    </h2>
                    <div className="text-amber-400/70">
                      {expandedGroup === letter ? "▲" : "▼"}
                    </div>
                  </div>

                  {/* Asset List View */}
                  {viewMode === "list" &&
                    (expandedGroup === null || expandedGroup === letter) && (
                      <div className="space-y-2">
                        {filteredGroups[letter].map((asset) => (
                          <div
                            key={asset.id}
                            className="bg-gray-700 hover:bg-gray-600 border border-amber-400/30 p-3 cursor-pointer transition-all rounded-lg group"
                            onClick={() =>
                              router.push(
                                `${router.basePath}/catalog/detail?id=${asset.id}`
                              )
                            }
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex items-center gap-3">
                                <span className="font-bold text-amber-300 group-hover:text-amber-200">
                                  {asset.name}
                                </span>
                                <span className="text-xs bg-amber-400/20 text-amber-300 px-2 py-1 rounded">
                                  {asset.id}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 mt-1 sm:mt-0">
                                <span
                                  className={`text-xs px-2 py-1 rounded-sm ${getStatusColor(
                                    asset.status
                                  )}`}
                                >
                                  {asset.status.toUpperCase()}
                                </span>
                                <MdInfo className="text-amber-400/50 group-hover:text-amber-400" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                  {/* Asset Grid View */}
                  {viewMode === "grid" &&
                    (expandedGroup === null || expandedGroup === letter) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {filteredGroups[letter].map((asset) => (
                          <div
                            key={asset.id}
                            className="bg-gray-700 hover:bg-gray-600 border border-amber-400/30 p-3 cursor-pointer transition-all rounded-lg group"
                            onClick={() =>
                              router.push(
                                `${router.basePath}/catalog/detail?id=${asset.id}`
                              )
                            }
                          >
                            <div className="flex flex-col">
                              <span className="font-bold text-amber-300 group-hover:text-amber-200 mb-2">
                                {asset.name}
                              </span>
                              <div className="flex justify-between items-center">
                                <span className="text-xs opacity-70">
                                  ID: {asset.id}
                                </span>
                                <span
                                  className={`text-xs px-2 py-1 rounded-sm ${getStatusColor(
                                    asset.status
                                  )}`}
                                >
                                  {asset.status.charAt(0)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                  {/* Asset Card View */}
                  {viewMode === "card" &&
                    (expandedGroup === null || expandedGroup === letter) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredGroups[letter].map((asset) => (
                          <div
                            key={asset.id}
                            className="bg-gray-700 hover:bg-gray-600 border-2 border-amber-400/30 p-4 cursor-pointer transition-all rounded-lg group h-40 flex flex-col justify-between"
                            onClick={() =>
                              router.push(
                                `${router.basePath}/catalog/detail?id=${asset.id}`
                              )
                            }
                          >
                            <div>
                              <h3 className="font-bold text-lg text-amber-300 group-hover:text-amber-200 mb-2 line-clamp-1">
                                {asset.name}
                              </h3>
                              <span className="text-xs opacity-70 block">
                                ID: {asset.id}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span
                                className={`text-xs px-2 py-1 rounded-sm ${getStatusColor(
                                  asset.status
                                )}`}
                              >
                                {asset.status.toUpperCase()}
                              </span>
                              <MdInfo className="text-amber-400/50 group-hover:text-amber-400" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                  {/* Asset Panel View */}
                  {viewMode === "panel" &&
                    (expandedGroup === null || expandedGroup === letter) && (
                      <div className="grid grid-cols-1 gap-2">
                        {filteredGroups[letter].map((asset) => (
                          <div
                            key={asset.id}
                            className="bg-gray-700 hover:bg-gray-600 border-l-4 border-amber-400 p-4 cursor-pointer transition-all rounded-r-lg group grid grid-cols-3"
                            onClick={() =>
                              router.push(
                                `${router.basePath}/catalog/detail?id=${asset.id}`
                              )
                            }
                          >
                            <div className="col-span-2">
                              <span className="font-bold text-amber-300 group-hover:text-amber-200">
                                {asset.name}
                              </span>
                              <div className="text-xs opacity-70 mt-1">
                                ID: {asset.id}
                              </div>
                            </div>
                            <div className="flex justify-end items-start">
                              <span
                                className={`text-xs px-2 py-1 rounded-sm ${getStatusColor(
                                  asset.status
                                )}`}
                              >
                                {asset.status.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                  {/* Minimal View */}
                  {viewMode === "minimal" &&
                    (expandedGroup === null || expandedGroup === letter) && (
                      <div className="flex flex-wrap gap-2">
                        {filteredGroups[letter].map((asset) => (
                          <div
                            key={asset.id}
                            className="bg-gray-700 hover:bg-amber-400 hover:text-gray-900 border border-amber-400/30 px-3 py-1 cursor-pointer transition-all rounded-lg group"
                            onClick={() =>
                              router.push(
                                `${router.basePath}/catalog/detail?id=${asset.id}`
                              )
                            }
                            title={`${asset.name} (${asset.status})`}
                          >
                            <span className="text-sm">{asset.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-800 border-2 border-amber-400 rounded-lg p-8 text-center">
              <h2 className="text-xl">
                {searchTerm || statusFilter !== "all"
                  ? "NO ASSETS MATCH YOUR SEARCH CRITERIA"
                  : "NO ASSETS FOUND IN DATABASE"}
              </h2>
              <p className="text-amber-400/70 mt-2">
                Try adjusting your search or filter settings
              </p>
            </div>
          )}

          {assetModal && (
            <AssetModal
              onClose={() => setAssetModal(false)}
              onSubmit={() => {}}
            />
          )}

          {/* Terminal Footer */}
          <div className="bg-gray-800 border-2 border-amber-400/30 rounded-lg p-3 mt-6 text-center text-xs text-amber-400/70 flex justify-between items-center">
            <span>PAJM SHIPYARD • CATALOG</span>
            <span>
              ASSETS: {grouped ? Object.values(grouped).flat().length : 0}
            </span>
          </div>
        </Fragment>
      )}
    </div>
  );
};

export default CatalogPage;
