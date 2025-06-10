import TableContainer from "@src/components/custom/table/Table";
import { AppDispatch, RootState } from "@src/slices/reducer";
import { deleteReportstData, getReportstData } from "@src/slices/thunk";
import { Plus } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Reports } from "@src/dtos";
import Pagination from "@src/components/common/pagination";
import DeleteModal from "@src/components/common/deleteModal";
import AddEditReports from "./addEditReports";

const ReportsHistory = () => {
  //get

  const dispatch: AppDispatch = useDispatch();
  const { reportList } = useSelector((state: RootState) => state.Reoprts);
  const [reportData, setReportData] = useState<Reports[]>([]);

  useEffect(() => {
    if (!reportList) {
      dispatch(getReportstData());
    } else {
      setReportData(reportList);
    }
  }, [reportList, dispatch]);

  //delete

  const [medicine, setMedicine] = useState<Reports | null>(null);

  const [show, setShow] = useState<boolean>(false);
  const toggleDelete = () => {
    setShow(false);
    setMedicine(null);
  };

  const onClickEventListDelete = (list: Reports) => {
    setMedicine(list);
    setShow(true);
  };

  const handleDeleteList = () => {
    if (medicine) {
      dispatch(deleteReportstData([medicine._id]));
      setShow(false);
    }
  };

  //add and edite
  const [modalState, setModalState] = useState<{ [key: string]: boolean }>({
    showAddReportForm: false,
    showEditReportForm: false,
  });

  const openModal = (key: string) =>
    setModalState((prev) => ({ ...prev, [key]: true }));
  const closeModal = (key: string) =>
    setModalState((prev) => ({ ...prev, [key]: false }));

  const [editMode, setEditMode] = useState(false);

  const [currentReports, setCurrentReports] = useState<Reports | null>(null);

  const handleCloseModal = () => {
    const modalKey = "showAddReportForm";
    closeModal(modalKey);
    setEditMode(false);
    setCurrentReports(null);
  };

  //pagination

  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEvents = reportData.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const getStatusClass = (status: string | undefined) => {
    switch (status) {
      case "Completed":
        return "badge badge-green";
      case "In Progress":
        return "badge badge-purple";
      case "Pending":
        return "badge badge-yellow";
      default:
        return "badge";
    }
  };

  const columns = useMemo(
    () => [
      {
        header: "Name",
        accessorKey: "name",
      },
      {
        header: "Date",
        accessorKey: "date",
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
        accessorKey: "action",
        cell: (value: any) => (
          <div className="flex items-center gap-2">
            <button
              title="Download"
              className="btn btn-sub-purple btn-icon !size-8 rounded-full"
            >
              <i className="ri-download-2-line"></i>
            </button>
            <button
              title="delete"
              className="btn btn-sub-red btn-icon !size-8 rounded-full"
              data-modal-target="deleteReportsModal"
              onClick={(e) => {
                e.preventDefault();
                onClickEventListDelete(value.row.original);
              }}
            >
              <i className="ri-delete-bin-line"></i>
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <React.Fragment>
      <div className="col-span-12 overflow-hidden xl:col-span-6 xl:row-span-2 card">
        <div className="flex items-center gap-3 card-header">
          <h6 className="card-title grow">Reports</h6>
          <button
            data-modal-target="addReportsModal"
            className="font-medium shrink-0 text-primary-500 link hover:text-primary-600"
            onClick={() => openModal("showAddReportForm")}
          >
            <Plus className="inline-block mb-1 align-middle size-4" /> Add
            Reports
          </button>
        </div>
        <div className="pt-0 card-body">
          <div>
            <TableContainer
              columns={columns || []}
              data={paginatedEvents}
              divClassName="overflow-x-auto table-box"
              tableClassName="table flush odd-striped whitespace-nowrap"
              thTrClassName="*:px-3 *:py-2.5"
              isHeader={false}
            />
          </div>
          <Pagination
            totalItems={reportData.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
      <DeleteModal
        show={show}
        handleHide={toggleDelete}
        deleteModalFunction={handleDeleteList}
      />
      <AddEditReports
        modalState={modalState}
        closeModal={handleCloseModal}
        reportsList={reportData}
        editMode={editMode}
        currentReports={currentReports}
      />
    </React.Fragment>
  );
};

export default ReportsHistory;
