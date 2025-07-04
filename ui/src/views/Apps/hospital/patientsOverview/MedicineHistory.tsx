import DeleteModal from "@src/components/common/deleteModal";
import Pagination from "@src/components/common/pagination";
import TableContainer from "@src/components/custom/table/Table";
import { Medicine } from "@src/dtos";
import { AppDispatch, RootState } from "@src/slices/reducer";
import { deleteMedicineData, getMedicineData } from "@src/slices/thunk";
import { Plus } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AddEditMedicine from "./addEditMedicine";

const MedicineHistory = () => {
  //get

  const dispatch: AppDispatch = useDispatch();
  const { medicine } = useSelector((state: RootState) => state.Reoprts);
  const [medicineData, setMedicineData] = useState<Medicine[]>([]);
  const [show, setShow] = useState<boolean>(false);
  const [medicines, setMedicines] = useState<Medicine | null>(null);
  useEffect(() => {
    if (!medicine) {
      dispatch(getMedicineData());
    } else {
      setMedicineData(medicine);
    }
  }, [medicine, dispatch]);

  const toggleDelete = () => {
    setShow(false);
    setMedicines(null);
  };

  const onClickEventListDelete = (list: Medicine) => {
    setMedicines(list);
    setShow(true);
  };

  const handleDeleteList = () => {
    if (medicines) {
      dispatch(deleteMedicineData([medicines._id]));
      setShow(false);
    }
  };

  const [modalState, setModalState] = useState<{ [key: string]: boolean }>({
    showAddMedicineForm: false,
    showEditMedicineForm: false,
  });

  const openModal = (key: string) =>
    setModalState((prev) => ({ ...prev, [key]: true }));
  const closeModal = (key: string) =>
    setModalState((prev) => ({ ...prev, [key]: false }));

  const [editMode, setEditMode] = useState(false);

  const [currentEvent, setCurrentEvent] = useState<Medicine | null>(null);

  const handleOpenModal = useCallback(
    (editMode: boolean = false, event: Medicine | null = null) => {
      setEditMode(editMode);
      setCurrentEvent(event);
      const modalKey = editMode
        ? "showEditMedicineForm"
        : "showAddMedicineForm";
      openModal(modalKey);
    },
    [],
  );

  const handleCloseModal = () => {
    const modalKey = editMode ? "showEditMedicineForm" : "showAddMedicineForm";
    closeModal(modalKey);
    setEditMode(false);
    setCurrentEvent(null);
  };

  //pagination

  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEvents = medicineData.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const columns = useMemo(
    () => [
      {
        header: "Date",
        accessorKey: "date",
      },
      {
        header: "Time",
        accessorKey: "time",
      },
      {
        header: "Medicine Name",
        accessorKey: "medicineName",
      },
      {
        header: "Dosage",
        accessorKey: "dosage",
      },
      {
        header: "Frequency",
        accessorKey: "frequency",
      },
      {
        header: "Start Date",
        accessorKey: "startDate",
      },
      {
        header: "End Date",
        accessorKey: "endDate",
      },
      {
        header: "Prescribing Doctor",
        accessorKey: "prescribingDoctor",
      },
      {
        header: "Reason/Condition",
        accessorKey: "reasonCondition",
      },
      {
        header: "Notes",
        accessorKey: "notes",
      },
      {
        header: "Action",
        accessorKey: "action",
        cell: (value: any) => (
          <div className="flex items-center gap-2">
            <button
              className="btn btn-sub-purple btn-icon !size-8 rounded-full"
              title="edit"
              data-modal-target="addMedicineModal"
              onClick={(e) => {
                e.preventDefault();
                handleOpenModal(true, value.row.original);
              }}
            >
              <i className="ri-pencil-line"></i>
            </button>
            <button
              className="btn btn-sub-red btn-icon !size-8 rounded-full"
              title="delete"
              data-modal-target="deleteMedicineModal"
              onClick={(e) => {
                e.preventDefault();
                onClickEventListDelete(value.row.original);
              }}
            >
              {" "}
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
      <div className="col-span-12 overflow-hidden card">
        <div className="flex items-center gap-3 card-header">
          <h6 className="card-title grow">Medicine History</h6>
          <button
            data-modal-target="addMedicineModal"
            className="font-medium shrink-0 text-primary-500 link hover:text-primary-600"
            onClick={() => openModal("showAddMedicineForm")}
          >
            <Plus className="inline-block mb-1 align-middle size-4" /> Add
            Medicine
          </button>
        </div>

        <div className="pt-0 card-body">
          <div>
            <TableContainer
              columns={columns || []}
              data={paginatedEvents}
              divClassName="overflow-x-auto table-box whitespace-nowrap"
              tableClassName="table flush whitespace-nowrap"
              thTrClassName="text-gray-500 bg-gray-100 dark:bg-dark-850 dark:text-dark-500"
            />
          </div>
          <Pagination
            totalItems={medicineData.length}
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
      <AddEditMedicine
        modalState={modalState}
        closeModal={handleCloseModal}
        eventList={medicineData}
        editMode={editMode}
        currentContact={currentEvent}
      />
    </React.Fragment>
  );
};

export default MedicineHistory;
