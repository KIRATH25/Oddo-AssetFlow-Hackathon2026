export type AssetStatus = 'Available' | 'Allocated' | 'Maintenance' | 'Disposed';

export interface Category {
  id: string;
  name: string;
  created_at?: string;
}

export interface Asset {
  id: string;
  name: string;
  asset_tag: string;
  category_id: string | null;
  status: AssetStatus;
  serial_number?: string | null;
  location?: string | null;
  purchase_date?: string | null;
  cost?: number | null;
  created_at: string;
  categories?: Category | null; // Joined table
}

export type MaintenancePriority = 'low' | 'medium' | 'high' | 'critical';
export type MaintenanceStatus = 'pending' | 'approved' | 'assigned' | 'inProgress' | 'resolved';

export interface MaintenanceRequest {
  id: string;
  asset_id: string;
  issue: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  cost?: number | null;
  resolved_at?: string | null;
  created_at: string;
  due_date?: string | null;
  assets?: { name: string } | null; // Joined table
}

export interface Allocation {
  id: string;
  asset_id: string;
  user_id: string;
  status: 'active' | 'returned';
  allocated_at: string;
  expected_return_date: string;
  returned_at?: string | null;
  created_at: string;
  assets?: { name: string } | null; // Joined table
}

export interface TransferRequest {
  id: string;
  asset_id: string;
  from_user_id: string;
  to_user_id: string;
  status: 'requested' | 'approved' | 'rejected';
  created_at: string;
}

export interface Booking {
  id: string;
  asset_id: string;
  user_id: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  start_time: string;
  end_time: string;
  created_at: string;
}

export interface AuditCycle {
  id: string;
  name: string;
  status: 'open' | 'closed';
  started_at: string;
  ended_at?: string | null;
  created_at: string;
}

export type ActivityType = 'allocation' | 'booking' | 'maintenance' | 'transfer';

export interface ActivityLog {
  id: string;
  actor_name: string;
  action_type: ActivityType;
  description: string;
  created_at: string;
}
