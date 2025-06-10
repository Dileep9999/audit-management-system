import { GroupVideoCallMemberRecord } from "@src/dtos";

// group video call user list
const groupVideoCallUserList: GroupVideoCallMemberRecord[] = [
  {
    _id: 1,
    name: "You",
    image: "https://images.kcubeinfotech.com/domiex/images/chat/video-7.png",
    isActive: false,
  },
  {
    _id: 2,
    name: "Michaela Sutton",
    image: "https://images.kcubeinfotech.com/domiex/images/chat/video-2.png",
    isActive: false,
  },
  {
    _id: 3,
    name: "James Davis",
    image: "https://images.kcubeinfotech.com/domiex/images/chat/video-3.png",
    isActive: true,
  },
  {
    _id: 4,
    name: "Wendy Dugan",
    image: "https://images.kcubeinfotech.com/domiex/images/chat/video-4.png",
    isActive: false,
  },
  {
    _id: 5,
    name: "Carlos Garcia",
    image: "https://images.kcubeinfotech.com/domiex/images/chat/video-5.png",
    isActive: false,
  },
  {
    _id: 6,
    name: "Lorna Yancey",
    image: "https://images.kcubeinfotech.com/domiex/images/chat/video-6.png",
    isActive: false,
  },
];

// key moments
const groupVideoKeyMoments = [
  { _id: 1, time: "00:01:48", text: "Weekly Update" },
  { _id: 2, time: "00:02:48", text: "Design Issue" },
  { _id: 3, time: "00:03:01", text: "Deadline Discuses" },
];

// group video chat
const videoGroupChat = [
  {
    _id: 1,
    roomId: 3,
    avatar: "https://images.kcubeinfotech.com/domiex/images/avatar/user-4.png",
    name: "Michaela Sutton",
    message: "I think this SRBThemes will provide us with some great insights.",
    time: "02:14",
  },
  {
    _id: 2,
    roomId: 3,
    avatar: "https://images.kcubeinfotech.com/domiex/images/avatar/user-12.png",
    name: "John Powers",
    message: "How about our problem last week?",
    time: "03:47",
  },
  {
    _id: 3,
    roomId: 3,
    avatar: "https://images.kcubeinfotech.com/domiex/images/avatar/user-11.png",
    name: "James Davis",
    message: "It's all clear, no worries😊",
    time: "04:32",
  },
  {
    _id: 4,
    roomId: 3,
    avatar: "https://images.kcubeinfotech.com/domiex/images/avatar/user-15.png",
    name: "Wendy Dugan",
    message: "Great tips thank you!",
    time: "08:47",
  },
  {
    _id: 5,
    roomId: 3,
    avatar: "https://images.kcubeinfotech.com/domiex/images/avatar/user-17.png",
    name: "Shopia Mia",
    message: "Love this conversation",
    time: "08:52",
  },
];

export { groupVideoCallUserList, groupVideoKeyMoments, videoGroupChat };
