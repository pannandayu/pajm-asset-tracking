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
  status: "Active" | "Inactive";
  warranty: string;
  active_date: Date;
  image_url: string;
  primary_user: string;
  notes: string;
  complementary_items?: ComplementaryItem[];
  component_items?: ComponentItem[];
}

export interface Complementary {
  id: string;
  name: string;
  brand: string;
  model: string;
  category: string;
  sub_category: string;
  department_owner: string;
  // serialpartnumber_suppliervendor_purchasehistory_activedate_warr: object[];
  serial_number: string;
  part_number: string;
  supplier_vendor: string;
  purchase_price: number;
  purchase_order_number: string;
  purchase_date: Date;
  status: string;
  warranty: string;
  active_date: Date;
  expected_lifespan: number;
  depreciation_method: string;
  depreciation_rate: number;
  notes: string;
}

export interface Component {
  id: string;
  name: string;
  brand: string;
  model: string;
  serial_number: string;
  part_number: string;
  supplier_vendor: string;
  purchase_price: number;
  purchase_order_number: string;
  purchase_date: Date;
  status: string;
  warranty: string;
  active_date: Date;
  expected_lifespan: number;
  notes: string;
}

export interface EventLog {
  event_id: string;
  asset_id: string;
  asset_name: string;
  event_type: "location" | "maintenance" | "repair";
  event_date: string;
  event_finish: string;
  recorded_by: string;
  description: string;
  created_at: string;
  status: string;
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

export interface MaterialItem {
  name: string;
  quantity: number;
  uom: string;
  price: number;
}

export interface Event {
  event_id: string;
  asset_id: string;
  asset_name: string;
  event_type: "location" | "maintenance" | "repair";
  event_date: string;
  event_start?: string;
  event_finish?: string;
  recorded_by: string;
  description: string;
  status: string;
  location?: {
    location: string;
    checked_out_by: string;
    checked_in_by?: string;
  };
  maintenance?: {
    maintenance_type: string;
    technician: string;
    duration_minutes: number;
    cost: number; // Total cost
    materials_used: MaterialItem[]; // Detailed items
    downtime_minutes: number;
    action: string;
    notes?: string;
  };
  repair?: {
    failure_description: string;
    technician: string;
    duration_minutes: number;
    cost: number; // Total cost
    materials_used: MaterialItem[]; // Detailed items
    downtime_minutes: number;
    root_cause: string;
    corrective_action: string;
    notes?: string;
  };
}

export interface ComplementaryItem {
  complementary_id: string;
  relation: string;
  name: string;
  brand: string;
  model: string;
  category: string;
  sub_category: string;
  archive: Archive[];
  notes: string;
}

export interface Archive {
  status: string;
  warranty: string;
  active_date: string;
  part_number: string;
  purchase_date: string;
  serial_number: string;
  purchase_price: number;
  supplier_vendor: string;
  purchase_order_number: string;
  notes: string;
}

export interface ComponentItem {
  component_id: string;
  relation: string;
  name: string;
  brand: string;
  model: string;
  archive: Archive2[];
  notes: string;
}

export interface Archive2 {
  status: string;
  warranty: string;
  active_date: string;
  part_number: string;
  purchase_date: string;
  serial_number: string;
  purchase_price: number;
  supplier_vendor: string;
  purchase_order_number: string;
  notes: string;
}
