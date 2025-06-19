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
    title: "Admins",
    icon: "users-round",
    lang: "Admins",
    link: "/admins",
    children: [],
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
