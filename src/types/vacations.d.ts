
export interface VacationPeriod {
  id: string;
  start_date: string;
  end_date: string;
  days_available: number;
  user_id: string;
  limit_date: string | null;
  status: string;
  sold_days: number;
  payment_date: string | null;
  contract_type: string;
}

export interface VacationRequest {
  id: string;
  start_date: string;
  end_date: string;
  days_taken: number;
  status: 'pending' | 'approved' | 'denied' | 'cancelled';
  comments?: string;
  sold_days: number;
  payment_date: string | null;
}
