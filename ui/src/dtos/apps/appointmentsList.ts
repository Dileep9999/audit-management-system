//appointment List

export interface AppointmentList {
  _id: number;
  image: string;
  date: string;
  startTime: string;
  endTime: string;
  patientName: string;
  doctor: string;
  treatmentType: string;
  status: string;
}
