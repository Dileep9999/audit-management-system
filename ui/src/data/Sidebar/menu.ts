import { MegaMenu } from "@dtos/layout";

const menu: MegaMenu[] = [
  {
    separator: true,
    title: "MENU",
    lang: "menu",
    children: [],
  },
  {
    separator: false,
    title: "Dashboard",
    icon: "gauge",
    lang: "Dashboard",
    link: "/dashboard",
    children: [],
  },
  {
    separator: false,
    title: "Audits",
    icon: "file-text",
    lang: "Audits",
    link: "/audits",
    children: [],
  },
  {
    separator: false,
    title: "Administrator",
    icon: "users-round",
    lang: "Administrator",
    children: [
      {
        title: "Users",
        lang: "Users",
        link: "/admins/users",
        children: [],
      },
      {
        title: "Users and Permissions",
        lang: "Users and Permissions",
        link: "/admins/users-permissions",
        children: [
          {
            title: "Roles and Permissions",
            lang: "Roles and Permissions",
            link: "/admins/roles-permissions",
            dropdownPosition: undefined,
            children: [],
          }
        ],
      },
      {
        title: "Workflows",
        lang: "Workflows", 
        link: "/admins/workflows",
        children: [],
      },
      {
        title: "Templates",
        lang: "Templates",
        link: "/templates",
        children: [],
      }
    ],
  },
  {
    separator: false,
    title: "FAQ",
    icon: "life-buoy",
    lang: "FAQ",
    link: "/faq",
    children: [],
  },
  {
    separator: false,
    title: "Entities",
    icon: "building",
    lang: "Entities",
    link: "/entities",
    children: [],
  },
];

export { menu };
