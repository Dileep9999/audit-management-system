export interface GroupVideoCallMemberRecord {
  _id: any;
  name: string;
  image: string;
  isActive: boolean;
}

export interface GroupKeyWordRecord {
  _id: any;
  time: string;
  text: string;
}

export interface GroupVideoCallChatRecord {
  _id: any;
  roomId: number;
  avatar: string;
  name: string;
  message: string;
  time: string;
}
