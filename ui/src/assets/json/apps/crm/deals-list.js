import user15 from "/assets/images/avatar/user-15.png";
import user10 from "/assets/images/avatar/user-10.png";
import user12 from "/assets/images/avatar/user-12.png";
import user16 from "/assets/images/avatar/user-16.png";
import brand2 from "/assets/images/brands/img-02.png";
import brand3 from "/assets/images/brands/img-03.png";
import brand4 from "/assets/images/brands/img-04.png";
import brand5 from "/assets/images/brands/img-05.png";
import brand6 from "/assets/images/brands/img-06.png";
import brand7 from "/assets/images/brands/img-07.png";
import brand8 from "/assets/images/brands/img-08.png";
import brand9 from "/assets/images/brands/img-09.png";
import brand10 from "/assets/images/brands/img-10.png";
import brand11 from "/assets/images/brands/img-11.png";
import brand12 from "/assets/images/brands/img-12.png";
import brand13 from "/assets/images/brands/img-13.png";
import brand14 from "/assets/images/brands/img-14.png";
import brand15 from "/assets/images/brands/img-15.png";
import brand18 from "/assets/images/brands/img-18.png";

const dealsData = [
  {
    image: brand2,
    projectName: "Marketing Strategy Review",
    createDate: "2024-04-15",
    endDate: "2024-05-05",
    amount: "$12,500",
    company: "MarketBoost Inc.",
    content: "Review and update marketing strategies for Q2.",
    status: "Active",
    userImage: user15,
    messages: [
      {
        id: 1,
        sender: "agent",
        text: "Hello! How can I help you with your marketing strategy?",
      },
      {
        id: 2,
        sender: "user",
        text: "I need assistance in updating our marketing plan for the upcoming quarter.",
      },
      {
        id: 3,
        sender: "agent",
        text: "Sure, let's review your current strategy first.",
      },
      { id: 4, sender: "user", text: "Here is the current plan..." },
    ],
  },
  {
    image: brand3,
    projectName: "Product Launch Event",
    createDate: "2024-06-11",
    endDate: "2024-06-20",
    amount: "$20,000",
    company: "TechNex Corporation",
    content: "Plan and execute the launch event for our new product line.",
    status: "Unactive",
    userImage: user10,
    messages: [
      {
        id: 1,
        sender: "agent",
        text: "Good day! How can I assist you with your product launch?",
      },
      {
        id: 2,
        sender: "user",
        text: "We need to plan a launch event for our new product.",
      },
      { id: 3, sender: "agent", text: "Do you have a date and venue in mind?" },
      {
        id: 4,
        sender: "user",
        text: "Yes, we are looking at the end of June at our main office.",
      },
    ],
  },
  {
    image: brand4,
    projectName: "Quarterly Financial Review",
    createDate: "2024-05-28",
    endDate: "2024-06-15",
    amount: "$18,200",
    company: "FinanceWise Ltd.",
    content: "Review financial performance for the first quarter of 2024.",
    status: "Active",
    userImage: user15,
    messages: [
      {
        id: 1,
        sender: "agent",
        text: "Hello! Ready to review your quarterly finances?",
      },
      { id: 2, sender: "user", text: "Yes, let's get started." },
      {
        id: 3,
        sender: "agent",
        text: "Please share the financial statements for the first quarter.",
      },
      { id: 4, sender: "user", text: "Here are the statements." },
    ],
  },
  {
    image: brand5,
    projectName: "Client Meeting",
    createDate: "2024-06-05",
    endDate: "2024-06-10",
    amount: "$8,500",
    company: "Client Solutions Inc.",
    content: "Meeting with potential clients to discuss project requirements.",
    status: "Unactive",
    userImage: user15,
    messages: [
      {
        id: 1,
        sender: "agent",
        text: "Hi! How can I help with your upcoming client meeting?",
      },
      {
        id: 2,
        sender: "user",
        text: "We need to prepare a presentation for our potential clients.",
      },
      {
        id: 3,
        sender: "agent",
        text: "What key points do you want to include?",
      },
      {
        id: 4,
        sender: "user",
        text: "Mainly our project capabilities and past successes.",
      },
    ],
  },
  {
    image: brand6,
    projectName: "Website Redesign",
    createDate: "2024-05-01",
    endDate: "2024-05-25",
    amount: "$14,000",
    company: "WebWorks Ltd.",
    content: "Redesign the company website for better user experience.",
    status: "Active",
    userImage: user15,
    messages: [
      {
        id: 1,
        sender: "agent",
        text: "Hello! How can we assist with your website redesign?",
      },
      {
        id: 2,
        sender: "user",
        text: "We want a more modern and user-friendly design.",
      },
      {
        id: 3,
        sender: "agent",
        text: "Any specific features or styles in mind?",
      },
      {
        id: 4,
        sender: "user",
        text: "Yes, we'd like it to be minimalist and mobile-responsive.",
      },
    ],
  },
  {
    image: brand7,
    projectName: "Employee Training Program",
    createDate: "2024-06-01",
    endDate: "2024-06-30",
    amount: "$10,000",
    company: "TalentHub Solutions",
    content:
      "Develop and implement a comprehensive training program for employees.",
    status: "Active",
    userImage: user15,
    messages: [
      {
        id: 1,
        sender: "agent",
        text: "Hi! How can we help with your employee training program?",
      },
      {
        id: 2,
        sender: "user",
        text: "We need a comprehensive training module for new hires.",
      },
      {
        id: 3,
        sender: "agent",
        text: "What topics should be covered in the training?",
      },
      {
        id: 4,
        sender: "user",
        text: "Onboarding, company policies, and job-specific skills.",
      },
    ],
  },
  {
    image: brand8,
    projectName: "Social Media Campaign",
    createDate: "2024-05-10",
    endDate: "2024-05-31",
    amount: "$16,500",
    company: "SocialNet Inc.",
    content:
      "Launch a targeted social media campaign to increase brand visibility.",
    status: "Unactive",
    userImage: user15,
    messages: [
      {
        id: 1,
        sender: "agent",
        text: "Hello! How can I assist with your social media campaign?",
      },
      {
        id: 2,
        sender: "user",
        text: "We want to create a campaign to boost our brand visibility.",
      },
      { id: 3, sender: "agent", text: "Which platforms are you targeting?" },
      {
        id: 4,
        sender: "user",
        text: "Mainly Instagram, Facebook, and Twitter.",
      },
    ],
  },
  {
    image: brand9,
    projectName: "Supply Chain Optimization",
    createDate: "2024-06-01",
    endDate: "2024-06-20",
    amount: "$22,000",
    company: "LogiTech Solutions",
    content:
      "Optimize the supply chain to reduce costs and improve efficiency.",
    status: "Unactive",
    userImage: user15,
    messages: [
      {
        id: 1,
        sender: "agent",
        text: "Hi! How can we assist with your supply chain optimization?",
      },
      {
        id: 2,
        sender: "user",
        text: "We need to streamline our supply chain to cut costs.",
      },
      {
        id: 3,
        sender: "agent",
        text: "What are the main issues you're facing?",
      },
      {
        id: 4,
        sender: "user",
        text: "Inefficiencies in inventory management and logistics.",
      },
    ],
  },
  {
    image: brand10,
    projectName: "Customer Satisfaction Survey",
    createDate: "2024-05-15",
    endDate: "2024-06-05",
    amount: "$5,000",
    company: "Feedback Systems Inc.",
    content:
      "Conduct a survey to measure customer satisfaction and identify areas.",
    status: "Active",
    userImage: user15,
    messages: [
      {
        id: 1,
        sender: "agent",
        text: "Hello! Ready to start your customer satisfaction survey?",
      },
      {
        id: 2,
        sender: "user",
        text: "Yes, we want to gather feedback from our customers.",
      },
      {
        id: 3,
        sender: "agent",
        text: "What key areas do you want to focus on?",
      },
      {
        id: 4,
        sender: "user",
        text: "Product quality, customer service, and delivery times.",
      },
    ],
  },
  {
    image: brand11,
    projectName: "Product Development Sprint",
    createDate: "2024-06-10",
    endDate: "2024-06-25",
    amount: "$17,500",
    company: "InnovateTech Ltd.",
    content: "Rapid development sprint for the new product feature.",
    status: "Unactive",
    userImage: user15,
    messages: [
      {
        id: 1,
        sender: "agent",
        text: "Hi! How can I help with your product development sprint?",
      },
      {
        id: 2,
        sender: "user",
        text: "We need to develop a new feature quickly.",
      },
      { id: 3, sender: "agent", text: "What's the feature and timeline?" },
      {
        id: 4,
        sender: "user",
        text: "A new user interface element, and we need it in two weeks.",
      },
    ],
  },

  {
    image: brand12,
    projectName: "Sales Training Workshop",
    createDate: "2024-05-20",
    endDate: "2024-06-10",
    amount: "$9,500",
    company: "SalesBoost Inc.",
    content:
      "Organize a workshop to train sales teams on effective selling techniques.",
    status: "Active",
    userImage: user15,
    messages: [
      {
        id: 1,
        sender: "agent",
        text: "Hello! How can we assist with your sales training workshop?",
      },
      {
        id: 2,
        sender: "user",
        text: "We need to enhance our sales team's selling skills.",
      },
      {
        id: 3,
        sender: "agent",
        text: "What specific areas do you want to focus on?",
      },
      {
        id: 4,
        sender: "user",
        text: "Negotiation tactics and closing deals effectively.",
      },
    ],
  },
  {
    image: brand13,
    projectName: "IT Infrastructure Upgrade",
    createDate: "2024-06-05",
    endDate: "2024-07-05",
    amount: "$30,000",
    company: "TechUpgrade Solutions",
    content:
      "Upgrade the company's IT infrastructure to improve performance and security.",
    status: "Unactive",
    userImage: user12,
    messages: [
      {
        id: 1,
        sender: "agent",
        text: "Hi! How can we assist with your IT infrastructure upgrade?",
      },
      {
        id: 2,
        sender: "user",
        text: "We need to enhance our network security and system performance.",
      },
      {
        id: 3,
        sender: "agent",
        text: "Have you identified specific areas that need improvement?",
      },
      {
        id: 4,
        sender: "user",
        text: "Yes, we need to update our servers and implement better security protocols.",
      },
    ],
  },
  {
    image: brand14,
    projectName: "Content Marketing Campaign",
    createDate: "2024-05-25",
    endDate: "2024-06-15",
    amount: "$12,000",
    company: "ContentWorks Ltd.",
    content:
      "Launch a content marketing campaign to attract and engage target audience.",
    status: "Active",
    userImage: user15,
    messages: [
      {
        id: 1,
        sender: "agent",
        text: "Hello! How can we assist with your content marketing campaign?",
      },
      {
        id: 2,
        sender: "user",
        text: "We need to create engaging content to attract our target audience.",
      },
      {
        id: 3,
        sender: "agent",
        text: "What platforms are you planning to use for distribution?",
      },
      {
        id: 4,
        sender: "user",
        text: "Mainly social media platforms like Facebook, Twitter, and LinkedIn.",
      },
    ],
  },
  {
    image: brand15,
    projectName: "Customer Relationship Management",
    createDate: "2024-06-01",
    endDate: "2024-06-30",
    amount: "$14,500",
    company: "CustPro Inc.",
    content:
      "Implement a CRM system to manage customer relationships retention.",
    status: "Unactive",
    userImage: user16,
    messages: [
      {
        id: 1,
        sender: "agent",
        text: "Hi! How can we assist with your CRM implementation?",
      },
      {
        id: 2,
        sender: "user",
        text: "We need a CRM system to better manage our customer relationships.",
      },
      {
        id: 3,
        sender: "agent",
        text: "Do you have any specific requirements for the CRM?",
      },
      {
        id: 4,
        sender: "user",
        text: "We need it to integrate with our existing systems and provide detailed customer insights.",
      },
    ],
  },
  {
    image: brand18,
    projectName: "Quality Assurance Audit",
    createDate: "2024-05-20",
    endDate: "2024-06-05",
    amount: "$11,200",
    company: "QualityCheck Ltd.",
    content:
      "Perform a quality assurance audit to ensure compliance with standards.",
    status: "Active",
    userImage: user12,
    messages: [
      {
        id: 1,
        sender: "agent",
        text: "Hello! How can we assist with your quality assurance audit?",
      },
      {
        id: 2,
        sender: "user",
        text: "We need to ensure that our processes comply with industry standards.",
      },
      {
        id: 3,
        sender: "agent",
        text: "Have you identified any areas of concern?",
      },
      {
        id: 4,
        sender: "user",
        text: "Yes, we need to improve our documentation processes and ensure consistent product quality.",
      },
    ],
  },
];
export default dealsData;
