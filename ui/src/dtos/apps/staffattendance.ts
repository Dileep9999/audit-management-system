// attendance
export interface Attendance {
  _id: number;
  date: string;
  checkInTime: string;
  checkOutTime: string;
  workedTime?: string;
  Difference?: string;
  status: string;
  shiftTime: string;
}
