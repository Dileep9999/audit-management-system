// store.ts (or store.js if you're not using TypeScript)

import { combineReducers, configureStore } from "@reduxjs/toolkit";
import layoutReducer from "./layout/reducer";
import contactReducer from "./crm/contact/reducer";
import dealReducer from "./crm/deal/reducer";
import leadReducer from "./crm/lead/reducer";
import eventGrid from "./events/grid/reducer";
import eventReducer from "./events/list/reducer";
import projectslistReducer from "./projects/list/reducer";
import projectsgridReducer from "./projects/grid/reducer";
import productReducer from "./ecommerce/products/list/reducer";
import customerListReducer from "./ecommerce/customer/list/reducer";
import shopCartReducer from "./ecommerce/shop_cart/reducer";
import checkoutReducer from "./ecommerce/checkout/reducer";
import wishListReducer from "./ecommerce/wishlist/reducer";
import manageReviewReducer from "./ecommerce/manage_reviews/reducer";
import orderReducer from "./ecommerce/order/reducer";
import categoryReducer from "./ecommerce/category_list/reducer";
import calendarReducer from "./calendar/reducer";
import mailReducer from "./email/reducer";
import fileListReducer from "./filemanager/file_list/reducer";
import folderListReducer from "./filemanager/folder_list/reducer";
import employeeSalaryReducer from "./hospital/employee_salary/reducer";
import departmentsReducers from "./hospital/departments/reducer";
import patientsReducers from "./hospital/patients/reducer";
import reportReducers from "./hospital/overview/reducer";
import holidaysReducres from "./hospital/staff_holidays/reducer";
import attendanceReducers from "./hospital/staff_attendance/reducer";
import staffLeaveReducers from "./hospital/staff_leaves/reducer";
import staffListReducers from "./hospital/staff_lists/reducer";
import appointmentsReducers from "./hospital/appointments_list/reducer";
import invoiceReducer from "./invoice/reducer";
import defaultChatListReducer from "./chat/default/reducer";
import contactChatReducer from "./chat/contact/reducer";
import groupChatListReducer from "./chat/group/reducer";
import libraryBookReducers from "./school/library_book/reducer";
import exmaListReducers from "./school/exam_schedule/reducer";
import parentsReducers from "./school/parents/reducer";
import teacherPayrollReducers from "./school/payroll/reducer";
import teacherListReducers from "./school/teachers/reducer";
import studentListReducers from "./school/student/reducer";
import examQuestionReducers from "./school/exam_question/reducer";

// Combine your reducers
const rootReducer = combineReducers({
  Layout: layoutReducer,
  Contact: contactReducer,
  Deal: dealReducer,
  Lead: leadReducer,
  EventGrid: eventGrid,
  EventList: eventReducer,
  ProjectsList: projectslistReducer,
  ProjectsGrid: projectsgridReducer,
  ProductList: productReducer,
  CustomerList: customerListReducer,
  Departments: departmentsReducers,
  ShopCarts: shopCartReducer,
  Checkout: checkoutReducer,
  WishList: wishListReducer,
  Patients: patientsReducers,
  Reoprts: reportReducers,
  Holidays: holidaysReducres,
  Attendance: attendanceReducers,
  Calendar: calendarReducer,
  EmployeeSalary: employeeSalaryReducer,
  Mail: mailReducer,
  StaffLeave: staffLeaveReducers,
  StaffList: staffListReducers,
  Appointments: appointmentsReducers,
  ManageReview: manageReviewReducer,
  Order: orderReducer,
  LibraryBooks: libraryBookReducers,
  ExamList: exmaListReducers,
  Parents: parentsReducers,
  Category: categoryReducer,
  DefaultChat: defaultChatListReducer,
  ContactChat: contactChatReducer,
  GroupChat: groupChatListReducer,
  Invoice: invoiceReducer,
  FileList: fileListReducer,
  FolderList: folderListReducer,
  TeacherPayroll: teacherPayrollReducers,
  TeacherList: teacherListReducers,
  StudentList: studentListReducers,
  ExamQuestionList: examQuestionReducers,
});

// Create a reducer to handle hydration (if needed)
const reducer = (
  state: ReturnType<typeof rootReducer> | undefined,
  action: any,
) => {
  // If you're using hydration (like with SSR), handle it here
  // Remove the HYDRATE part if not using SSR
  if (action.type === "HYDRATE") {
    const nextState = {
      ...state, // use previous state
      ...action.payload, // apply delta from hydration
    };
    return nextState;
  }
  return rootReducer(state, action);
};

// Configure the Redux store
export const makeStore = () =>
  configureStore({
    reducer,
    // Optional: Add middleware here if needed
  });

const store = makeStore();

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
