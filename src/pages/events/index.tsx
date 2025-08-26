import EventModal from "@/components/FormModal";
import { useAuth } from "@/context/AuthContext";
import { assetAtom, eventAtom } from "@/context/jotai";
import { EventLog } from "@/types";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { useAtom } from "jotai";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import {
  MdSearch,
  MdFilterList,
  MdRefresh,
  MdViewList,
  MdGridOn,
  MdDashboard,
  MdViewCarousel,
  MdViewQuilt,
  MdViewModule,
  MdInfo,
} from "react-icons/md";
import { CiDatabase } from "react-icons/ci";
import Layout from "../Layout";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Jakarta");

const getTypeColor = (type: string) => {
  switch (type) {
    case "location":
      return "bg-amber-500 text-black";
    case "maintenance":
      return "bg-green-600 text-white";
    case "repair":
      return "bg-red-700 text-white";
    default:
      return "bg-gray-600 text-white";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "closed":
      return "bg-green-900 text-green-300";
    case "open":
      return "bg-blue-900 text-blue-300";
    default:
      return "bg-orange-900 text-orange-300";
  }
};

const EventIndex = () => {
  const router = useRouter();
  const auth = useAuth();
  const [activeAsset, setActiveAsset] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredLogs, setFilteredLogs] = useState<EventLog[]>();
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState<
    "list" | "grid" | "card" | "minimal" | "panel"
  >("list");
  const [isLoading, setIsLoading] = useState(true);

  const [eventLog, setEventLog] = useAtom(eventAtom);
  const [asset, setAsset] = useAtom(assetAtom);

  const filterEvents = () => {
    if (!eventLog) return [];

    return eventLog.filter((log) => {
      const matchesAsset =
        activeAsset === "all" || log.asset_id === activeAsset;
      const matchesSearch =
        log.asset_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.event_type.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesAsset && matchesSearch;
    });
  };

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/fetch-events");
      const result = await response.json();

      if (result.message) {
        throw new Error(result.message);
      }

      setEventLog(result);
      setFilteredLogs(filterEvents());
    } catch (err: any) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAsset = async () => {
    try {
      const response = await fetch("/api/fetch-asset");
      const result = await response.json();

      if (result.message) {
        throw new Error(result.message);
      }

      setAsset(result);
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

    fetchEvents();

    if (!asset) {
      fetchAsset();
    }
  }, [auth.loading, auth.user]);

  useEffect(() => {
    if (eventLog) {
      setFilteredLogs(filterEvents());
    }
  }, [eventLog, searchTerm, activeAsset]);

  return (
    <div className="min-h-screen bg-gray-900 text-amber-300 font-mono px-4 lg:px-8 pt-4 pb-8 mx-auto">
      {auth.user && (
        <Layout>
          <>
            {/* Terminal Header */}
            <div className="bg-gray-800 border-2 border-amber-400 p-6 mb-6 rounded-xl shadow-lg shadow-amber-400/10">
              <div className="flex flex-col gap-4 sm:flex-row justify-between items-start sm:items-center mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-400 rounded-lg">
                    <MdViewModule className="text-2xl text-gray-900" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold tracking-wider">
                      EVENT LOGS MODULE
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Search Box */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MdSearch className="text-amber-400/70" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search events..."
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
                    value={activeAsset}
                    onChange={(e) => setActiveAsset(e.target.value)}
                  >
                    <option value="all">All Assets</option>
                    {asset &&
                      asset.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.id} - {a.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-amber-400/70 text-sm">Display:</span>
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
                        viewMode === "card"
                          ? "bg-amber-400 text-gray-900"
                          : "text-amber-300"
                      }`}
                      onClick={() => setViewMode("card")}
                      title="Card View"
                    >
                      <MdDashboard className="text-xl" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={fetchEvents}
                    className="flex items-center gap-2 bg-gray-700 hover:bg-amber-500 hover:text-gray-900 text-amber-300 border-2 border-amber-400/30 px-3 py-1 rounded-lg transition-all"
                    title="Refresh Data"
                  >
                    <MdRefresh className="text-lg" />
                    <span className="text-sm">REFRESH</span>
                  </button>

                  {auth.user?.tagging !== "2" && (
                    <button
                      onClick={() => setShowModal(true)}
                      className="bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold py-2 px-4 border-b-4 border-amber-600 hover:border-amber-500 rounded-lg transition-all text-sm flex items-center gap-2"
                    >
                      <span>+ NEW EVENT</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="bg-gray-800 border-2 border-amber-400/30 rounded-xl p-4 mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-2">
                <div className="text-2xl font-bold text-amber-400">
                  {eventLog ? eventLog.length : 0}
                </div>
                <div className="text-xs text-amber-400/70">TOTAL EVENTS</div>
              </div>
              <div className="text-center p-2">
                <div className="text-2xl font-bold text-green-400">
                  {eventLog
                    ? eventLog.filter((e) => e.status === "closed").length
                    : 0}
                </div>
                <div className="text-xs text-amber-400/70">CLOSED</div>
              </div>
              <div className="text-center p-2">
                <div className="text-2xl font-bold text-blue-400">
                  {eventLog
                    ? eventLog.filter((e) => e.status === "open").length
                    : 0}
                </div>
                <div className="text-xs text-amber-400/70">OPEN</div>
              </div>
              <div className="text-center p-2">
                <div className="text-2xl font-bold text-amber-400">
                  {filteredLogs ? filteredLogs.length : 0}
                </div>
                <div className="text-xs text-amber-400/70">FILTERED</div>
              </div>
            </div>

            {/* Event Logs Content */}
            {isLoading ? (
              <div className="bg-gray-800 border-2 border-amber-400 rounded-xl p-8 text-center">
                <h2 className="text-xl animate-pulse flex items-center justify-center gap-2">
                  <MdRefresh className="animate-spin" /> INITIALIZING
                  DATABASE...
                </h2>
              </div>
            ) : filteredLogs && filteredLogs.length > 0 ? (
              <div className="space-y-6">
                {/* List View */}
                {viewMode === "list" && (
                  <div className="space-y-4">
                    {filteredLogs.map((event) => (
                      <div
                        key={event.event_id}
                        className="bg-gray-800 border-2 border-amber-400 rounded-xl p-5 shadow-lg shadow-amber-400/10 cursor-pointer hover:bg-gray-750 transition-all"
                        onClick={() =>
                          router.push(
                            `${router.basePath}/events/detail?id=${event.event_id}`
                          )
                        }
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            <span
                              className={`px-3 py-1 rounded-lg text-sm font-bold ${getTypeColor(
                                event.event_type
                              )}`}
                            >
                              {event.event_type.toUpperCase()}
                            </span>
                            <span className="text-sm text-amber-200">
                              {dayjs(event.event_date)
                                .utc()
                                .format("DD MMM YYYY - HH:mm")}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-amber-300">
                              {event.asset_id} - {event.asset_name}
                            </span>
                            <span
                              className={`px-2 py-1 rounded-md text-xs ${getStatusColor(
                                event.status
                              )}`}
                            >
                              {event.status.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        <div className="mt-2 px-3 py-2 bg-gray-750 border-l-4 border-amber-400 rounded-r-lg">
                          <p className="text-amber-100">{event.description}</p>
                        </div>

                        <div className="mt-3 text-xs opacity-70">
                          ID: {event.event_id}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Grid View */}
                {viewMode === "grid" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredLogs.map((event) => (
                      <div
                        key={event.event_id}
                        className="bg-gray-800 border-2 border-amber-400 rounded-xl p-4 shadow-lg shadow-amber-400/10 cursor-pointer hover:bg-gray-750 transition-all h-40 flex flex-col justify-between"
                        onClick={() =>
                          router.push(
                            `${router.basePath}/events/detail?id=${event.event_id}`
                          )
                        }
                      >
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <span
                              className={`px-2 py-1 rounded-md text-xs font-bold ${getTypeColor(
                                event.event_type
                              )}`}
                            >
                              {event.event_type.charAt(0).toUpperCase()}
                            </span>
                            <span className="text-xs text-amber-200">
                              {dayjs(event.event_date).utc().format("DD/MM/YY")}
                            </span>
                          </div>
                          <h3 className="font-bold text-amber-300 line-clamp-2 text-sm mb-2">
                            {event.asset_name}
                          </h3>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs opacity-70">
                            ID: {event.event_id.slice(0, 6)}...
                          </span>
                          <span
                            className={`px-2 py-1 rounded-md text-xs ${getStatusColor(
                              event.status
                            )}`}
                          >
                            {event.status.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Card View */}
                {viewMode === "card" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredLogs.map((event) => (
                      <div
                        key={event.event_id}
                        className="bg-gray-800 border-2 border-amber-400 rounded-xl p-4 shadow-lg shadow-amber-400/10 cursor-pointer hover:bg-gray-750 transition-all h-48 flex flex-col justify-between"
                        onClick={() =>
                          router.push(
                            `${router.basePath}/events/detail?id=${event.event_id}`
                          )
                        }
                      >
                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <span
                              className={`px-3 py-1 rounded-lg text-sm font-bold ${getTypeColor(
                                event.event_type
                              )}`}
                            >
                              {event.event_type.toUpperCase()}
                            </span>
                            <span className="text-xs text-amber-200">
                              {dayjs(event.event_date)
                                .utc()
                                .format("DD MMM YYYY")}
                            </span>
                          </div>
                          <h3 className="font-bold text-lg text-amber-300 mb-2">
                            {event.asset_name}
                          </h3>
                          <p className="text-amber-100 text-sm line-clamp-2">
                            {event.description}
                          </p>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs opacity-70">
                            ID: {event.event_id}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-md text-xs ${getStatusColor(
                              event.status
                            )}`}
                          >
                            {event.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Panel View */}
                {viewMode === "panel" && (
                  <div className="grid grid-cols-1 gap-3">
                    {filteredLogs.map((event) => (
                      <div
                        key={event.event_id}
                        className="bg-gray-800 border-l-4 border-amber-400 p-4 cursor-pointer transition-all rounded-r-xl hover:bg-gray-750 grid grid-cols-3"
                        onClick={() =>
                          router.push(
                            `${router.basePath}/events/detail?id=${event.event_id}`
                          )
                        }
                      >
                        <div className="col-span-2">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`px-2 py-1 rounded-md text-xs font-bold ${getTypeColor(
                                event.event_type
                              )}`}
                            >
                              {event.event_type.toUpperCase()}
                            </span>
                            <span className="text-xs text-amber-200">
                              {dayjs(event.event_date)
                                .utc()
                                .format("DD MMM YYYY")}
                            </span>
                          </div>
                          <span className="font-bold text-amber-300">
                            {event.asset_name}
                          </span>
                          <div className="text-xs opacity-70 mt-1">
                            ID: {event.event_id}
                          </div>
                        </div>
                        <div className="flex flex-col items-end justify-between">
                          <span
                            className={`px-2 py-1 rounded-md text-xs ${getStatusColor(
                              event.status
                            )}`}
                          >
                            {event.status.toUpperCase()}
                          </span>
                          <MdInfo className="text-amber-400/50 mt-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Minimal View */}
                {viewMode === "minimal" && (
                  <div className="flex flex-wrap gap-3">
                    {filteredLogs.map((event) => (
                      <div
                        key={event.event_id}
                        className="bg-gray-800 hover:bg-amber-400 hover:text-gray-900 border border-amber-400/30 px-4 py-2 cursor-pointer transition-all rounded-xl group"
                        onClick={() =>
                          router.push(
                            `${router.basePath}/events/detail?id=${event.event_id}`
                          )
                        }
                        title={`${event.event_type}: ${event.asset_name} (${event.status})`}
                      >
                        <span className="text-sm">{event.asset_name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-800 border-2 border-amber-400 rounded-xl p-8 text-center">
                <h2 className="text-xl">
                  {searchTerm || activeAsset !== "all"
                    ? "NO EVENTS MATCH YOUR SEARCH CRITERIA"
                    : "NO EVENTS FOUND IN DATABASE"}
                </h2>
                <p className="text-amber-400/70 mt-2">
                  Try adjusting your search or filter settings
                </p>
              </div>
            )}

            {/* Footer */}
            <div className="bg-gray-800 border-2 border-amber-400/30 rounded-xl p-4 mt-6 text-center text-xs text-amber-400/70 flex justify-between items-center">
              <span>PAJM SHIPYARD • EVENT LOGS</span>
              <span>
                DISPLAYING {filteredLogs ? filteredLogs.length : 0} OF{" "}
                {eventLog ? eventLog.length : 0} RECORDS
              </span>
            </div>

            {showModal && (
              <EventModal
                onClose={() => {
                  setShowModal(false);
                }}
                onSubmit={() => {
                  setShowModal(false);
                  fetchEvents();
                }}
              />
            )}
          </>
        </Layout>
      )}
    </div>
  );
};

export default EventIndex;
