import { LAYOUT_LANGUAGES } from "@src/components/constants/layout";
import { FC, ReactElement } from "react";

// Define the type for pages that use a custom layout
export type NextPageWithLayout = FC & {
  getLayout?: (page: ReactElement) => ReactElement;
};

export interface InterNationalization {
  _id: any;
  language: string;
  code: LAYOUT_LANGUAGES;
  flag: string;
}

export interface MegaMenu {
  title: string;
  lang: string;
  icon?: string;
  link?: string;
  separator: boolean;
  dropdownPosition?: null | undefined;
  children?: MainMenu[]; //any[]
  megaMenu?: boolean;
}

export interface MainMenu {
  title: string;
  lang: string;
  link: string;
  dropdownPosition?: null | undefined;
  children?: SubMenu[]; //any[]
}

export interface SubMenu {
  title: string;
  lang: string;
  link: string;
  dropdownPosition: null | undefined;
  children: any;
}
export interface Teacher {
  teacherName: string;
  image?: string;
  email: string;
  gross: number;
  taxes: number;
  netSalary: number;
  performance: string;
  status: string;
}
export interface TeacherList {
  teacherId: string;
  teacherName: string;
  image?: string;
  email: string;
  phone: string;
  salary: number;
  experience: number;
  title: string;
  date: string;
}

export interface TeacherListList {
  _id: string;
  lastSchool: string;

  teacherId: string;
  teacherName: string;
  image?: string;
  email: string;
  phone: string;
  salary: number;
  experience: number;
  title: string;
  date: string;
}
