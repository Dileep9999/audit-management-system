import { GroupChatMemberRecord, GroupChatRecord } from "@src/dtos";

// default group chat messages
const defaultGroupChatMessages: GroupChatRecord = {
  _id: 6,
  roomId: 2,
  name: "Deployment Disruptor",
  image: "https://images.kcubeinfotech.com/domiex/images/brands/img-02.png",
  message:
    "Wait, what’s the presentation about again? Asking for a friend… 👀📊",
  time: "09:42 AM",
  unread: false,
  active: false,
  badge: 0,
  members: [
    {
      _id: 1,
      name: "Alice Johnson",
      role: "Admin",
      avatar:
        "https://images.kcubeinfotech.com/domiex/images/avatar/user-6.png",
    },
    {
      _id: 2,
      name: "Jari Mäkinen",
      role: "Developer",
      avatar:
        "https://images.kcubeinfotech.com/domiex/images/avatar/user-31.png",
    },
    {
      _id: 3,
      name: "Bob Lee",
      role: "Team Leader",
      avatar:
        "https://images.kcubeinfotech.com/domiex/images/avatar/user-37.png",
    },
    {
      _id: 4,
      name: "Shopia",
      role: "Designer",
      avatar:
        "https://images.kcubeinfotech.com/domiex/images/avatar/user-17.png",
    },
  ],
  messages: [
    {
      _id: 1,
      user: {
        name: "Alice Johnson",
        avatar:
          "https://images.kcubeinfotech.com/domiex/images/avatar/user-10.png",
        status: "online",
      },
      timestamp: "Today, 09:00 AM",
      message: "Morning everyone! Ready for the presentation today? 💻🎤",
      type: "received",
    },
    {
      _id: 2,
      user: {
        name: "Bob Lee",
        avatar:
          "https://images.kcubeinfotech.com/domiex/images/avatar/user-11.png",
        status: "offline",
      },
      message:
        "I hope the coffee machine is working! We’re gonna need it. ☕😂",
      type: "received",
      timestamp: "Today, 09:02 AM",
    },
    {
      _id: 3,
      user: {
        name: "Shopia",
        avatar:
          "https://images.kcubeinfotech.com/domiex/images/avatar/user-17.png",
        status: "online",
      },
      message: "No worries, I brought a backup! 🙌☕",
      type: "received",
      timestamp: "Today, 09:05 AM",
    },
  ],
};

// group member list
const groupChatMemberList: GroupChatMemberRecord[] = [
  {
    _id: 1,
    roomId: 2,
    avatar: "https://images.kcubeinfotech.com/domiex/images/avatar/user-5.png",
    name: "Auli Ahokas",
    value: "Auli Ahokas",
    role: "Designer",
  },
  {
    _id: 2,
    roomId: 2,
    avatar: "https://images.kcubeinfotech.com/domiex/images/avatar/user-6.png",
    name: "Sirpa Kolkka",
    value: "Sirpa Kolkka",
    role: "Developer",
  },
  {
    _id: 3,
    roomId: 2,
    avatar: "https://images.kcubeinfotech.com/domiex/images/avatar/user-37.png",
    name: "Leena Laine",
    value: "Leena Laine",
    role: "Admin",
  },
  {
    _id: 4,
    roomId: 2,
    avatar: "https://images.kcubeinfotech.com/domiex/images/avatar/user-36.png",
    name: "Risto Saraste",
    value: "Risto Saraste",
    role: "Team Leader",
  },
  {
    _id: 5,
    roomId: 2,
    avatar: "https://images.kcubeinfotech.com/domiex/images/avatar/user-9.png",
    name: "Mikko Virtanen",
    value: "Mikko Virtanen",
    role: "Manager",
  },
  {
    _id: 6,
    roomId: 2,
    avatar: "https://images.kcubeinfotech.com/domiex/images/avatar/user-29.png",
    name: "Tuula Nieminen",
    value: "Tuula Nieminen",
    role: "Developer",
  },
  {
    _id: 7,
    roomId: 2,
    avatar: "https://images.kcubeinfotech.com/domiex/images/avatar/user-31.png",
    name: "Rosa Lynch",
    value: "Rosa Lynch",
    role: "Product Manager",
  },
  {
    _id: 8,
    roomId: 2,
    avatar: "https://images.kcubeinfotech.com/domiex/images/avatar/user-12.png",
    name: "Meagan Snow",
    value: "Meagan Snow",
    role: "QA Engineer",
  },
  {
    _id: 9,
    roomId: 2,
    avatar: "https://images.kcubeinfotech.com/domiex/images/avatar/user-6.png",
    name: "Jessica Perry",
    value: "Jessica Perry",
    role: "UX Specialist",
  },
  {
    _id: 10,
    roomId: 2,
    avatar: "https://images.kcubeinfotech.com/domiex/images/avatar/user-21.png",
    name: "Julie Lawson",
    value: "Julie Lawson",
    role: "Designer",
  },
  {
    _id: 11,
    roomId: 2,
    avatar: "https://images.kcubeinfotech.com/domiex/images/avatar/user-14.png",
    name: "Fiona Smith",
    value: "Fiona Smith",
    role: "Admin",
  },
  {
    _id: 12,
    roomId: 2,
    avatar: "https://images.kcubeinfotech.com/domiex/images/avatar/user-17.png",
    name: "Linda Stucky",
    value: "Linda Stucky",
    role: "Team Leader",
  },
];

export { defaultGroupChatMessages, groupChatMemberList };
