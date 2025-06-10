// user chat
export interface UserChatMessageRecord {
  _id: number;
  sender: string;
  time: string;
  text?: string;
  avatar?: string;
  avatarName?: string;
  type: string;
  images?: string[];
  extraImagesCount?: number;
  contentType?: string;
  replyText?: any;
}

export interface UserChatRecord {
  _id: number;
  roomId: number;
  name: string;
  receiverImage?: string;
  senderImage?: string;
  receiverName?: string;
  status: "online" | "offline";
  lastMessage: string;
  timestamp: string;
  unread: number;
  lastSeen: string;
  messages: UserChatMessageRecord[];
}

export interface MenuChatSidebarRecord {
  _id: number;
  roomId: number;
  name?: string;
  image?: string;
  isOpenCompanyChat: boolean;
}

// group chat
export interface GroupChatMember {
  _id: number;
  name: string;
  role: string;
  avatar: string;
}

export interface GroupChatMessage {
  _id: number;
  user: {
    name: string;
    avatar: string;
    status: "online" | "offline";
  };
  timestamp: string;
  message: string;
  type: "sent" | "received";
  images?: string[];
  contentType?: string;
  replyText?: any;
}

export interface GroupChatRecord {
  _id: number;
  roomId: number;
  name: string;
  image: string;
  message: string;
  time: string;
  badge: number;
  unread: boolean;
  active: boolean;
  members: GroupChatMember[];
  messages: GroupChatMessage[];
}

export interface GroupChatMemberRecord {
  _id: number;
  roomId: number;
  avatar: string;
  name: string;
  value: string;
  role: string;
}

// contact chat
export interface ContactChatRecord {
  _id: number;
  roomId: number;
  name: string;
  avatar: string;
}
