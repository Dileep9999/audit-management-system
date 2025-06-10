import { AppDispatch, RootState } from "@src/slices/reducer";
import {
  deleteEmployeeSalaryData,
  getEmployeeSalaryData,
} from "@src/slices/thunk";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { employeeSalary, NextPageWithLayout } from "@src/dtos";
import TableContainer from "@src/components/custom/table/Table";
import Pagination from "@src/components/common/pagination";
import DeleteModal from "@src/components/common/deleteModal";
import BreadCrumb from "@src/components/common/breadCrumb";
import { LAYOUT_DIRECTION } from "@src/components/constants/layout";
import { Toaster } from "react-hot-toast";
import AddEditEmployeeSalary from "@src/views/apps/hospital/payroll/addEditEmployeeSalary";

const PayrollEmployeeSalary: NextPageWithLayout = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { salary } = useSelector((state: RootState) => state.EmployeeSalary);
  const { layoutDirection } = useSelector((state: RootState) => state.Layout);
  const [employeeSalaryData, setEmployeeSalaryData] = useState<
    employeeSalary[]
  >([]);
  useEffect(() => {
    document.title =
      "Employee Salary | Domiex - React TS Admin & Dashboard Template";
  }, []);

  //get
  useEffect(() => {
    if (salary === null) {
      dispatch(getEmployeeSalaryData());
    } else {
      setEmployeeSalaryData(salary);
    }
  }, [salary, dispatch]);

  const [show, setShow] = useState<boolean>(false);
  const [event, setEvent] = useState<employeeSalary | null>(null);
  const toggleDelete = () => {
    setShow(false);
    setEvent(null);
  };

  const handleDeleteList = () => {
    if (event) {
      dispatch(deleteEmployeeSalaryData([event._id]));
      setShow(false);
    }
  };

  const onClickEventListDelete = (list: employeeSalary) => {
    setEvent(list);
    setShow(true);
  };
  const [modalState, setModalState] = useState<{ [key: string]: boolean }>({
    showAddEmployeeForm: false,
    showEmployeeForm: false,
  });

  const openModal = (key: string) =>
    setModalState((prev) => ({ ...prev, [key]: true }));
  const closeModal = (key: string) =>
    setModalState((prev) => ({ ...prev, [key]: false }));

  const [editMode, setEditMode] = useState(false);

  const [currentEvent, setCurrentEvent] = useState<employeeSalary | null>(null);

  const handleOpenModal = useCallback(
    (editMode: boolean = false, event: employeeSalary | null = null) => {
      setEditMode(editMode);
      setCurrentEvent(event);
      const modalKey = editMode ? "showEmployeeForm" : "showAddEmployeeForm";
      openModal(modalKey);
    },
    [],
  );

  const handleCloseModal = () => {
    const modalKey = editMode ? "showEmployeeForm" : "showAddEmployeeForm";
    closeModal(modalKey);
    setEditMode(false);
    setCurrentEvent(null);
  };

  const getStatusClass = (status: string | undefined) => {
    switch (status) {
      case "Successful":
        return "badge badge-green";
      case "Pending":
        return "badge badge-yellow";
      case "Failed":
        return "badge badge-red";
      default:
        return "badge";
    }
  };

  const columns = useMemo(
    () => [
      {
        header: "Employee Name",
        accessorKey: "employeeName",
      },
      {
        header: "Email",
        accessorKey: "email",
      },
      {
        header: "Phone Number",
        accessorKey: "phoneNumber",
      },
      {
        header: "Department",
        accessorKey: "department",
      },
      {
        header: "Monthly Salary",
        accessorKey: "monthlySalary",
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: ({ row }: any) => {
          const { status } = row.original;
          return <span className={getStatusClass(status)}>{status}</span>;
        },
      },
      {
        header: "Action",
        accessorKey: "",
        cell: (value: any) => (
          <>
            <div className="flex items-center gap-2">
              <button
                className="btn btn-sub-primary btn-icon !size-8"
                title="edit"
                onClick={(e) => {
                  e.preventDefault();
                  handleOpenModal(true, value.row.original);
                }}
              >
                <i className="ri-pencil-line"></i>
              </button>
              <button
                className="btn btn-sub-red btn-icon !size-8"
                title="delete"
                data-modal-target="deleteModal"
                onClick={(e) => {
                  e.preventDefault();
                  onClickEventListDelete(value.row.original);
                }}
              >
                <i className="ri-delete-bin-line"></i>
              </button>
            </div>
          </>
        ),
      },
    ],
    [handleOpenModal],
  );
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEvents = employeeSalaryData.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  return (
    <React.Fragment>
      <BreadCrumb title="Employee Salary" subTitle="Payroll" />
      <div className="card">
        <div className="flex items-center gap-3 card-header">
          <h6 className="card-title grow">Employee</h6>
          <button type="button" className="btn btn-primary shrink-0">
            Download
          </button>
        </div>

        <div className="pt-0 card-body">
          <TableContainer
            columns={columns || []}
            data={paginatedEvents}
            divClassName="overflow-x-auto table-box"
            tableClassName="table flush"
            thTrClassName="text-gray-500 bg-gray-100 dark:bg-dark-850 dark:text-dark-500"
          />
          <Pagination
            totalItems={employeeSalaryData.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      <Toaster
        position="top-right"
        reverseOrder={layoutDirection === LAYOUT_DIRECTION.RTL}
      />

      <DeleteModal
        show={show}
        handleHide={toggleDelete}
        deleteModalFunction={handleDeleteList}
      />

      <AddEditEmployeeSalary
        modalState={modalState}
        closeModal={handleCloseModal}
        salaryList={employeeSalaryData}
        editMode={editMode}
        currentSalary={currentEvent}
      />
    </React.Fragment>
  );
};

export default PayrollEmployeeSalary;
