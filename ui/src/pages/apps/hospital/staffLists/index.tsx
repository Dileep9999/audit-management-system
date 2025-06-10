import { AppDispatch, RootState } from "@src/slices/reducer";
import { deleteStaffListData, getStaffListData } from "@src/slices/thunk";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NextPageWithLayout, StaffList } from "@src/dtos";
import { CirclePlus } from "lucide-react";
import TableContainer from "@src/components/custom/table/Table";
import Pagination from "@src/components/common/pagination";
import AddEditStaffList from "@src/views/apps/hospital/staffListHoliday/addEditStaffList";
import DeleteModal from "@src/components/common/deleteModal";
import BreadCrumb from "@src/components/common/breadCrumb";
import { LAYOUT_DIRECTION } from "@src/components/constants/layout";
import { Link } from "react-router-dom";
import { Toaster } from "react-hot-toast";

const StaffLists: NextPageWithLayout = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { staffList } = useSelector((state: RootState) => state.StaffList);
  const { layoutDirection } = useSelector((state: RootState) => state.Layout);
  const [staffListData, setStaffListData] = useState<StaffList[]>([]);
  const [modalState, setModalState] = useState<{ [key: string]: boolean }>({
    showAddStaffForm: false,
    showEditStaffForm: false,
  });
  const [event, setEvent] = useState<StaffList | null>(null);
  const [show, setShow] = useState<boolean>(false);
  const [editMode, setEditMode] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<StaffList | null>(null);
  useEffect(() => {
    document.title = "List View | Domiex - React TS Admin & Dashboard Template";
  }, []);

  //get
  useEffect(() => {
    if (!staffList) {
      dispatch(getStaffListData());
    } else {
      setStaffListData(staffList);
    }
  }, [staffList, dispatch]);

  const toggleDelete = () => {
    setShow(false);
    setEvent(null);
  };

  const onClickEventListDelete = (list: StaffList) => {
    setEvent(list);
    setShow(true);
  };

  const handleDeleteList = () => {
    if (event) {
      dispatch(deleteStaffListData([event._id]));
      setShow(false);
    }
  };

  const openModal = (key: string) =>
    setModalState((prev) => ({ ...prev, [key]: true }));
  const closeModal = (key: string) =>
    setModalState((prev) => ({ ...prev, [key]: false }));

  const handleOpenModal = useCallback(
    (editMode: boolean = false, event: StaffList | null = null) => {
      setEditMode(editMode);
      setCurrentEvent(event);
      const modalKey = editMode ? "showEditStaffForm" : "showAddStaffForm";
      openModal(modalKey);
    },
    [],
  );

  const handleCloseModal = () => {
    const modalKey = editMode ? "showEditStaffForm" : "showAddStaffForm";
    closeModal(modalKey);
    setEditMode(false);
    setCurrentEvent(null);
  };

  //pagination
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEvents = staffListData.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const columns = useMemo(
    () => [
      {
        header: "Id",
        accessorKey: "staffId",
      },
      {
        header: "Staff Name",
        accessorKey: "name",
        cell: ({ row }: any) => {
          const { image, name, role } = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="relative text-gray-500 bg-gray-100 rounded-full dark:text-dark-500 dark:bg-dark-850 size-10">
                {image ? (
                  <img
                    src={image}
                    alt={name}
                    className="rounded-full"
                    width={40}
                    height={40}
                  />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-gray-500 bg-gray-100 rounded-full dark:text-dark-500 dark:bg-dark-850">
                    {name.charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <h6 className="mb-1">
                  <Link to="#!">{name}</Link>
                </h6>
                <p className="text-sm text-gray-500 dark:text-dark-500">
                  {role}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        header: "Department",
        accessorKey: "department",
      },
      {
        header: "Email",
        accessorKey: "email",
      },
      {
        header: "Phone",
        accessorKey: "phone",
      },
      {
        header: "Joining Date",
        accessorKey: "date",
      },
      {
        header: "Action",
        accessorKey: "",
        cell: ({ row }: any) => (
          <div className="flex items-center gap-2">
            <button
              className="btn btn-sub-gray btn-icon !size-8 rounded-md"
              title="edit"
              data-modal-target="addStaffModal"
              onClick={(e) => {
                e.preventDefault();
                handleOpenModal(true, row.original);
              }}
            >
              <i className="ri-pencil-line"></i>
            </button>
            <button
              className="btn btn-sub-red btn-icon !size-8 rounded-md"
              title="delete"
              data-modal-target="deleteModal"
              onClick={(e) => {
                e.preventDefault();
                onClickEventListDelete(row.original);
              }}
            >
              <i className="ri-delete-bin-line"></i>
            </button>
          </div>
        ),
      },
    ],
    [handleOpenModal],
  );

  return (
    <React.Fragment>
      <BreadCrumb title="List View" subTitle="Staff" />
      <div className="grid grid-cols-12 gap-x-space">
        <div className="col-span-12 card">
          <div className="flex items-center gap-3 card-header">
            <h6 className="card-title grow">Staff List</h6>
            <button
              type="button"
              className="btn btn-primary shrink-0"
              data-modal-target="addStaffModal"
              onClick={() => openModal("showAddStaffForm")}
            >
              <CirclePlus className="inline-block mr-1 size-4" /> Add Staff
            </button>
          </div>
          <div className="pt-0 card-body">
            <div>
              <TableContainer
                columns={columns}
                data={paginatedEvents}
                thClassName="!font-medium cursor-pointer"
                divClassName="overflow-x-auto table-box whitespace-nowrap"
                tableClassName="table flush"
                thTrClassName="text-gray-500 bg-gray-100 dark:bg-dark-850 dark:text-dark-500"
              />
              <Pagination
                totalItems={staffListData.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={handlePageChange}
              />
            </div>
          </div>
        </div>
      </div>
      <DeleteModal
        show={show}
        handleHide={toggleDelete}
        deleteModalFunction={handleDeleteList}
      />
      <AddEditStaffList
        modalState={modalState}
        closeModal={handleCloseModal}
        staffList={staffListData}
        editMode={editMode}
        currentStaff={currentEvent}
      />

      <Toaster
        position="top-right"
        reverseOrder={layoutDirection === LAYOUT_DIRECTION.RTL}
      />
    </React.Fragment>
  );
};

export default StaffLists;
