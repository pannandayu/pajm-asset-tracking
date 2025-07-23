import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { Event, MaterialItem } from "@/types";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import "dayjs/locale/id";

dayjs.extend(utc);

// Helper functions
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

const calculateTotalCost = (materials: MaterialItem[] = []): number => {
  return materials.reduce(
    (total, item) => total + item.quantity * item.price,
    0
  );
};

const EventDetail = () => {
  // Hooks and state
  const auth = useAuth();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { id: eventId } = router.query;

  // Handlers
  const handleBack = () => {
    router.push("/events");
  };

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/fetch-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      });

      const result = await response.json();

      if (response.ok) {
        setEvent(result);
      } else {
        throw new Error(result.error || "Failed to fetch event");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    if (!auth.user) {
      router.push("/");
      return;
    }

    if (eventId) {
      fetchEvent();
    }
  }, [auth.user, eventId]);

  // Render functions
  const renderLocationDetails = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DetailItem 
          label="Location" 
          value={event?.location?.location || "-"} 
        />
        <DetailItem 
          label="Checked Out By" 
          value={event?.location?.checked_out_by || "-"} 
        />
        
        {event?.location?.checked_in_by && (
          <DetailItem 
            label="Checked In By" 
            value={event.location.checked_in_by} 
            fullWidth
          />
        )}
      </div>
    </div>
  );

  const renderMaintenanceDetails = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DetailItem 
          label="Type" 
          value={event?.maintenance?.maintenance_type?.toUpperCase() || "-"} 
        />
        <DetailItem 
          label="Technician" 
          value={event?.maintenance?.technician || "-"} 
        />
        <DetailItem 
          label="Event Start" 
          value={dayjs.utc(event?.event_start).locale("id").format("DD MMM YYYY - HH:mm")} 
        />
        <DetailItem 
          label="Event Finish" 
          value={dayjs.utc(event?.event_finish).locale("id").format("DD MMM YYYY - HH:mm")} 
        />
        <DetailItem 
          label="Duration" 
          value={`${event?.maintenance?.duration_minutes || 0} minutes`} 
        />
        <DetailItem 
          label="Downtime" 
          value={`${event?.maintenance?.downtime_minutes || 0} minutes`} 
        />
        <DetailItem 
          label="Total Cost" 
          value={formatCurrency(calculateTotalCost(event?.maintenance?.materials_used))} 
          fullWidth
        />
      </div>

      {event && event.maintenance && event?.maintenance?.materials_used?.length > 0 && (
        <MaterialsTable 
          materials={event.maintenance.materials_used} 
          title="Materials Used" 
        />
      )}

      <DetailItem 
        label="Action" 
        value={event?.maintenance?.action || "-"} 
        multiline 
      />
      <DetailItem 
        label="Notes" 
        value={event?.maintenance?.notes || "-"} 
        multiline 
      />
    </div>
  );

  const renderRepairDetails = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DetailItem 
          label="Failure Description" 
          value={event?.repair?.failure_description || "-"} 
        />
        <DetailItem 
          label="Technician" 
          value={event?.repair?.technician || "-"} 
        />
        <DetailItem 
          label="Event Start" 
          value={dayjs.utc(event?.event_start).locale("id").format("DD MMM YYYY - HH:mm")} 
        />
        <DetailItem 
          label="Event Finish" 
          value={dayjs.utc(event?.event_finish).locale("id").format("DD MMM YYYY - HH:mm")} 
        />
        <DetailItem 
          label="Duration" 
          value={`${event?.repair?.duration_minutes || 0} minutes`} 
        />
        <DetailItem 
          label="Downtime" 
          value={`${event?.repair?.downtime_minutes || 0} minutes`} 
        />
        <DetailItem 
          label="Total Cost" 
          value={formatCurrency(calculateTotalCost(event?.repair?.materials_used))} 
          fullWidth
        />
      </div>

      {event && event.repair && event?.repair?.materials_used?.length > 0 && (
        <MaterialsTable 
          materials={event.repair.materials_used} 
          title="Materials Used" 
        />
      )}

      <DetailItem 
        label="Root Cause" 
        value={event?.repair?.root_cause || "-"} 
        multiline 
      />
      <DetailItem 
        label="Corrective Action" 
        value={event?.repair?.corrective_action || "-"} 
        multiline 
      />
      <DetailItem 
        label="Notes" 
        value={event?.repair?.notes || "-"} 
        multiline 
      />
    </div>
  );

  const renderEventDetails = () => {
    if (!event) return null;

    switch (event.event_type) {
      case "location":
        return renderLocationDetails();
      case "maintenance":
        return renderMaintenanceDetails();
      case "repair":
        return renderRepairDetails();
      default:
        return <p className="text-amber-400">Unknown event type</p>;
    }
  };

  // Loading state
  if (loading) {
    return (
      <PageContainer>
        <div className="max-w-6xl mx-auto border-2 border-amber-400 bg-gray-800 p-6 shadow-lg shadow-amber-400/20 text-center">
          <p className="text-xl">LOADING EVENT DATA...</p>
        </div>
      </PageContainer>
    );
  }

  // Error state
  if (error) {
    return (
      <PageContainer>
        <div className="max-w-6xl mx-auto border-2 border-red-500 bg-gray-800 p-6 shadow-lg shadow-red-500/20">
          <p className="text-red-400 font-bold">ERROR:</p>
          <p className="text-red-300">{error}</p>
          <BackButton onClick={handleBack} />
        </div>
      </PageContainer>
    );
  }

  // No event found
  if (!event) {
    return (
      <PageContainer>
        <div className="max-w-6xl mx-auto border-2 border-amber-400 bg-gray-800 p-6 shadow-lg shadow-amber-400/20 text-center">
          <p className="text-xl">EVENT NOT FOUND</p>
          <BackButton onClick={handleBack} />
        </div>
      </PageContainer>
    );
  }

  // Main render
  return (
    <PageContainer>
      <div className="max-w-6xl mx-auto border-2 border-amber-400 bg-gray-800 p-6 shadow-lg shadow-amber-400/20">
        <HeaderSection 
          title="EVENT DETAILS" 
          subtitle={event.event_id} 
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <SectionTitle title="GENERAL INFO" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailItem 
                label="Event Type" 
                value={event.event_type.toUpperCase()} 
              />
              <DetailItem 
                label="Asset ID" 
                value={event.asset_id} 
              />
              <DetailItem 
                label="Asset Name" 
                value={event.asset_name} 
              />
              <DetailItem 
                label="Event Date" 
                value={dayjs.utc(event.event_date).locale("id").format("DD MMM YYYY - HH:mm")} 
              />
              <DetailItem 
                label="Recorded By" 
                value={event.recorded_by} 
              />
              <DetailItem 
                label="Status" 
                value={event.status[0].toUpperCase() + event.status.slice(1)} 
              />
            </div>

            <DetailItem 
              label="Description" 
              value={event.description || "-"} 
              className="mt-4" 
            />
          </div>

          <div>
            <SectionTitle title={`${event.event_type.toUpperCase()} DETAILS`} />
            {renderEventDetails()}
          </div>
        </div>

        <div className="flex justify-between">
          <BackButton onClick={handleBack} />
        </div>
      </div>
    </PageContainer>
  );
};

// Reusable components
const PageContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-gray-700 text-amber-300 p-4 font-mono">
    {children}
  </div>
);

const HeaderSection = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div className="mb-6 border-b-2 border-amber-400 pb-4">
    <h1 className="text-2xl md:text-3xl font-bold tracking-wider text-center">
      {title}
    </h1>
    <p className="text-center text-amber-400 mt-2">{subtitle}</p>
  </div>
);

const SectionTitle = ({ title }: { title: string }) => (
  <h1 className="text-xl md:text-2xl font-bold mb-4 pb-2 border-b border-amber-400">
    {title}
  </h1>
);

const DetailItem = ({ 
  label, 
  value, 
  multiline = false, 
  fullWidth = false,
  className = ""
}: {
  label: string;
  value: string;
  multiline?: boolean;
  fullWidth?: boolean;
  className?: string;
}) => (
  <div className={fullWidth ? "col-span-2" : className}>
    <h3 className="font-bold text-amber-400 mb-1">{label}:</h3>
    <p className={`bg-gray-700 border border-amber-400 p-2 rounded ${
      multiline ? "whitespace-pre-line" : ""
    }`}>
      {value}
    </p>
  </div>
);

const MaterialsTable = ({ materials, title }: { materials: MaterialItem[]; title: string }) => (
  <div>
    <h3 className="font-bold text-amber-400 mb-2">{title}:</h3>
    <div className="bg-gray-700 border border-amber-400 p-2 rounded overflow-x-auto">
      <table className="w-full min-w-max">
        <thead>
          <tr className="border-b text-sm border-amber-400">
            <th className="text-left pb-1 px-2">Material</th>
            <th className="text-left pb-1 px-2">Qty</th>
            <th className="text-left pb-1 px-2">UoM</th>
            <th className="text-left pb-1 px-2">Unit Price</th>
            <th className="text-left pb-1 px-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {materials.map((item, index) => (
            <tr key={index} className="border-b border-gray-600">
              <td className="py-1 px-2">{item.name}</td>
              <td className="py-1 px-2">{item.quantity}</td>
              <td className="py-1 px-2">{item.uom}</td>
              <td className="py-1 px-2">{formatCurrency(item.price)}</td>
              <td className="py-1 px-2">
                {formatCurrency(item.quantity * item.price)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const BackButton = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="mt-4 px-4 py-2 bg-amber-700 hover:bg-amber-600 text-black border-2 border-amber-500 font-bold transition-all"
  >
    ← BACK TO EVENTS
  </button>
);

export default EventDetail;

// todo buat
// 2. buat action text area dengan tanggal, waktu mulai, dan waktu selesai
// 3. buat event details updatable
