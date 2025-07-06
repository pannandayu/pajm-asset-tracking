export interface Asset {
  id: string;
  name: string;
  brand: string;
  model: string;
  serial_number: string;
  part_number: string;
  category: string;
  sub_category: string;
  department_owner: string;
  purchase_price: number;
  purchase_order_number: string;
  vendor_supplier: string;
  expected_lifespan: number;
  depreciation_method: string;
  current_book_value: number;
  purchase_date: Date;
  depreciation_rate: number;
  status: "Aktif" | "Nonaktif";
  warranty: string;
  active_date: Date;
  image_url: string;
  primary_user: string;
}

export interface EventLog {
  event_id: string;
  asset_id: string;
  asset_name: string;
  event_type: "location" | "maintenance" | "repair";
  event_date: string;
  recorded_by: string;
  description: string;
  created_at: string;
}

export interface LocationHistory {
  id: string;
  date: string;
  building: string;
  floor: string;
  room: string;
  checkedOutBy: string;
  checkedInBy: string;
  notes: string;
}

export interface MaintenanceRecord {
  id: string;
  date: string;
  type: "Preventive" | "Repair";
  description: string;
  technician: string;
  duration: number; // in hours
  cost: number;
  partsReplaced: string[];
  downtime: number; // in hours
}
