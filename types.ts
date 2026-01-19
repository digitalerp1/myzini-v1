
export interface OwnerProfile {
  uid: string;
  school_name: string;
  principal_name?: string;
  mobile_number: string;
  school_image_url?: string;
  register_date?: string;
  address?: string;
  website?: string;
  school_code?: string;
  // Infrastructure fields
  hostel_managment?: HostelBuilding[]; // JSON structure for Buildings -> Floors -> Rooms
  owner_name?: string;
}

export interface HostelBuilding {
  id: string;
  name: string;
  floors: HostelFloor[];
}

export interface HostelFloor {
  id: string;
  name: string;
  rooms: string[]; // Array of room numbers/names
}

export interface HostelPaymentHistory {
    date: string;
    amount: number;
    mode?: string; // Cash, Online, etc.
    note?: string;
}

export interface HostelFeeRecord {
    id: string; // Unique ID for the transaction
    month: string;
    amount: number; // Total amount due
    paid_amount: number; // Total amount paid so far
    status: 'Paid' | 'Due' | 'Partial';
    paid_date?: string; // Date of last payment or full payment
    description?: string; // Notes like "Late fine" or "Advance"
    payment_history?: HostelPaymentHistory[]; // Array to track partial payments
}

export interface StudentHostelData {
    is_active: boolean;
    building_id: string;
    building_name: string;
    floor_id: string;
    floor_name: string;
    room_no: string;
    joining_date: string;
    exit_date?: string;
    monthly_fee: number;
    fee_records: HostelFeeRecord[];
}

export interface Staff {
  id: number;
  uid: string;
  staff_id: string;
  name: string;
  mobile: string;
  gmail?: string;
  father_name?: string;
  mother_name?: string;
  address?: string;
  password?: string;
  highest_qualification?: string;
  joining_date: string;
  photo_url?: string;
  salary_amount: number;
  total_paid: number;
  total_dues: number;
  is_active: boolean;
  previous_dues?: number;
}

export interface SalaryRecord {
  id: number;
  uid: string;
  staff_id: string;
  date_time: string;
  amount: number;
  notes?: string;
}

export interface Subject {
  id: number;
  uid: string;
  subject_name: string;
}

export interface Class {
  id: number;
  uid: string;
  class_name: string;
  staff_id?: string;
  school_fees?: number;
}

export interface Assignment {
  id: number;
  uid: string;
  class_id: number;
  subject_id: number;
  staff_id?: string;
  incoming_time?: string;
  outgoing_time?: string;
}

export interface OtherFee {
  fees_name: string;
  amount: number;
  dues_date: string;
  paid_date?: string;
}

export interface Student {
  id: number;
  uid: string;
  roll_number?: string;
  name: string;
  mobile?: string;
  gmail?: string;
  password?: string;
  father_name?: string;
  mother_name?: string;
  class?: string;
  address?: string;
  photo_url?: string;
  aadhar?: string;
  gender?: 'Male' | 'Female' | 'Other';
  date_of_birth?: string;
  registration_date: string;
  caste?: string;
  blood_group?: string;
  previous_school_name?: string;
  other_fees?: OtherFee[];
  // Monthly fee tracking
  january?: string;
  february?: string;
  march?: string;
  april?: string;
  may?: string;
  june?: string;
  july?: string;
  august?: string;
  september?: string;
  october?: string;
  november?: string;
  december?: string;
  previous_dues?: number;
  
  // Infrastructure fields (Assigned Room)
  building_name?: string;
  floor_name?: string;
  room_no?: string;
  
  // New comprehensive hostel data
  hostel_data?: StudentHostelData;
}

export interface Expense {
  id: number;
  uid: string;
  date: string;
  category: string;
  notes?: string;
  amount: number;
}

export interface Attendance {
  id?: number;
  uid: string;
  class_id: number;
  date: string; // 'YYYY-MM-DD'
  present?: string; // Comma-separated roll numbers
  absent?: string;  // Comma-separated roll numbers
}

export interface StaffAttendance {
  id?: number;
  uid: string;
  staff_id?: string; // Comma-separated staff IDs
  date: string; // 'YYYY-MM-DD'
  created_at?: string;
}

export interface FeeType {
  id: number;
  uid: string;
  fees_name: string;
  amount: number;
  frequency: string;
}

export interface SubjectMarks {
  subject_name: string;
  total_marks: number | string;
  pass_marks: number | string;
  obtained_marks: number | string;
}

export interface ExamResult {
  id: number;
  uid: string;
  exam_name: string;
  class: string;
  roll_number: string;
  subjects_marks: {
    subjects: SubjectMarks[];
  };
  created_at: string;
}

export interface Driver {
  id: number;
  created_at: string;
  uid: string;
  driver_id: string;
  name: string;
  mobile: string;
  aadhar?: string;
  photo_url?: string;
  address?: string;
  van_number: string;
  van_image_url?: string;
  driving_licence?: string;
  students_list?: { class: string; roll_number: string; name: string }[];
}
