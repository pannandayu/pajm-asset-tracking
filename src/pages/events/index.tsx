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

const EventIndex = () => {
  const router = useRouter();
  const auth = useAuth();
  const [activeAsset, setActiveAsset] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredLogs, setFilteredLogs] = useState<EventLog[]>();
  const [showModal, setShowModal] = useState(false);

  const [eventLog, setEventLog] = useAtom(eventAtom);
  const [asset, setAsset] = useAtom(assetAtom);

  const sort = (list: any[]) => {
    return list.sort(
      (a: any, b: any) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  };

  const filter = (list: any[]) => {
    return list.filter(
      (log) =>
        (activeAsset === "all" || log.assetId === activeAsset) &&
        (log.asset_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/fetch-events");
      const result = await response.json();

      if (result.message) {
        throw new Error(result.message);
      }

      const sortedEvent = sort(result);
      setEventLog(sortedEvent);

      const filteredEvents = filter(sortedEvent);
      setFilteredLogs(filteredEvents);
    } catch (err: any) {
      console.log(err);
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
      const sortedEvent = sort(eventLog);
      setEventLog(sortedEvent);

      const filteredEvents = filter(sortedEvent);
      setFilteredLogs(filteredEvents);
    }
  }, [eventLog, searchTerm]);

  return (
    <div className="bg-gray-900 min-h-screen p-4 font-mono text-amber-300">
      {/* Header */}
      <div className="max-w-5xl mx-auto">
        <div className="bg-gray-800 rounded-lg p-4 mb-4 border-2 border-amber-400 shadow-lg shadow-amber-400/20">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <h1 className="text-2xl font-bold mb-4 sm:mb-0 tracking-wider border-b-2 border-amber-400 pb-1">
              EVENT LOGS MODULE
            </h1>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <div className="flex-1 sm:w-48">
                <label className="block text-xs text-amber-300 mb-1">
                  FILTER ASSET:
                </label>
                {asset ? (
                  <select
                    className="w-full bg-gray-700 text-amber-200 border border-amber-400 px-2 py-1 text-sm rounded-sm focus:outline-none focus:ring-1 focus:ring-amber-400"
                    value={activeAsset}
                    onChange={(e) => setActiveAsset(e.target.value)}
                  >
                    <option value="all" className="bg-gray-800">
                      ALL ASSETS
                    </option>
                    {asset.map((asset) => (
                      <option
                        key={asset.id}
                        value={asset.id}
                        className="bg-gray-800"
                      >
                        {asset.id} - {asset.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="h-8 bg-gray-700 animate-pulse rounded-sm"></div>
                )}
              </div>
              <div className="flex-1 sm:w-64">
                <label className="block text-xs text-amber-300 mb-1">
                  SEARCH EVENTS:
                </label>
                <input
                  type="text"
                  className="w-full bg-gray-700 text-amber-200 border border-amber-400 px-2 py-1 text-sm rounded-sm focus:outline-none focus:ring-1 focus:ring-amber-400"
                  placeholder="SEARCH ASSETS OR EVENTS"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between gap-4">
            <button
              onClick={() => setShowModal(true)}
              className="bg-amber-600 hover:bg-amber-500 text-black font-bold py-2 px-4 border-b-4 border-amber-700 hover:border-amber-600 rounded-sm transition-all text-sm"
            >
              RECORD NEW EVENT
            </button>
            <button
              className="bg-gray-700 hover:bg-gray-600 text-amber-300 border-2 border-amber-400 px-3 py-1 font-bold transition-all text-sm"
              onClick={() => router.push("/")}
            >
              ← TERMINAL
            </button>
          </div>
        </div>

        {/* Event Logs */}
        {filteredLogs ? (
          <div className="space-y-3">
            {filteredLogs.length === 0 ? (
              <div className="bg-gray-800 p-8 text-center text-amber-300 border-2 border-dashed border-amber-400 rounded-lg">
                NO EVENTS FOUND IN DATABASE
              </div>
            ) : (
              filteredLogs.map((event) => (
                <div
                  key={event.event_id}
                  className="bg-gray-800 rounded-sm border-2 border-amber-400 hover:border-amber-300 transition-all shadow-lg shadow-amber-400/10"
                >
                  <div className="p-4">
                    {/* Event Header */}
                    <div className="flex flex-wrap items-baseline gap-2 mb-2">
                      <span
                        className={`px-2 py-1 rounded-sm text-xs font-bold ${getTypeColor(
                          event.event_type
                        )}`}
                      >
                        {event.event_type.toUpperCase()}
                      </span>
                      <span className="text-xs text-amber-200">
                        {dayjs
                          .utc(event.event_date)
                          .locale("id")
                          .format("DD MMM YYYY - HH:mm")}
                      </span>
                      <br />
                      <span className="text-xs opacity-70">
                        ID: {event.event_id}
                      </span>
                      <span className="sm:ml-0 md:ml-0 lg:ml-auto text-sm font-medium text-amber-300">
                        {event.asset_id} - {event.asset_name}
                      </span>
                    </div>

                    {/* Event Description */}
                    <div className="mt-2 mb-3 px-2 py-1 bg-gray-700 border-l-4 border-amber-400">
                      <p className="text-amber-100">{event.description}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="bg-gray-800 p-8 text-center text-amber-300 border-2 border-dashed border-amber-400 rounded-lg animate-pulse">
            LOADING DATABASE RECORDS...
          </div>
        )}

        {/* Footer */}
        {filteredLogs && eventLog && (
          <div className="mt-6 pt-4 text-center text-xs text-amber-300 border-t border-amber-400">
            SYSTEM STATUS: DISPLAYING {filteredLogs.length} OF {eventLog.length}{" "}
            RECORDS
          </div>
        )}
        <div className="bg-gray-800 border-2 border-amber-400 p-2 mt-4 text-center text-xs text-amber-400">
          PAJM SHIPYARD • EVENT LOGS
        </div>
      </div>

      {showModal && (
        <EventModal
          onClose={() => setShowModal(false)}
          onSubmit={() => {
            setShowModal(false);
            fetchEvents();
          }}
        />
      )}
    </div>
  );
};

export default EventIndex;
