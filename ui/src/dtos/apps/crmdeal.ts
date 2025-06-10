// crm deal --------------------------------
export interface DealItem {
  _id: any;
  image: string;
  projectName: string;
  createDate: string;
  endDate: string;
  amount: string;
  company: string;
  content: string;
  status: string;
  userimage: string;
  messages: DealMessage[];
}

export interface DealMessage {
  _id: any;
  sender: "agent" | "user";
  text: string;
}
