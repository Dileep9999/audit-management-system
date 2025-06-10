// email
export interface Replys {
  _id: number;
  sender: string;
  email: string;
  avatarImage?: any;
  date: string;
  subject: string;
  message: string;
}

export interface Email {
  _id: number;
  sender: string;
  email: string;
  date: string;
  subject: string;
  message: string;
  avatarImage?: any;
  avatarText?: string;
  avatarColor?: string;
  badges: string[];
  type: string;
  replies?: Replys[]; // Optional replies array
}
