// reports
export interface Reports {
  _id: number;
  name: string;
  clinical: string;
  impressions: string;
  recommendations: string;
  date: string;
  status: string;
  doctor: string;
}

// medicine
export interface Medicine {
  _id: number;
  date: string;
  time: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate: string;
  prescribingDoctor: string;
  reasonCondition: string;
  notes: string;
}

// appointments
export interface Appointments {
  id: number;
  date: string;
  time: string;
  treatmentType: string;
  doctor: string;
  reasonCondition: string;
  notes: string;
  status: string;
}
