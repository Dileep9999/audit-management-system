import {
  Dropdown,
  DropdownButton,
  DropdownMenu,
} from "@src/components/custom/dropdown/dropdown";
import TableContainer from "@src/components/custom/table/Table";
import { AppDispatch, RootState } from "@src/slices/reducer";
import { Download, Plus, Search, Trash } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AddEditCrmContact from "@src/views/apps/crm/addEditCrmContact";
import { CrmContactItems } from "@src/dtos/apps/crm";
import { deleteContactListData, getContactData } from "@src/slices/thunk";
import DeleteModal from "@src/components/common/deleteModal";
import BreadCrumb from "@src/components/common/breadCrumb";
import Pagination from "@src/components/common/pagination";
import { NextPageWithLayout } from "@src/dtos";
import { Link } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { LAYOUT_DIRECTION } from "@src/components/constants/layout";

// add & edit modal
interface ModalState {
  showAddContactForm: boolean;
  showEditContactForm: boolean;
}

const CrmContact: NextPageWithLayout = () => {
  const dispatch: AppDispatch = useDispatch();

  // get data
  const { contact } = useSelector((state: RootState) => state.Contact);
  const { layoutDirection } = useSelector((state: RootState) => state.Layout);
  const [editMode, setEditMode] = useState(false);
  const [currentContact, setCurrentContact] = useState<CrmContactItems | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [contactList, setContactList] = useState<CrmContactItems[]>([]);
  const [modalState, setModalState] = useState<ModalState>({
    showAddContactForm: false,
    showEditContactForm: false,
  });
  const [selectAll, setSelectAll] = useState(false);
  const [deletedListData, setDeletedListData] = useState<number[]>([]);
  const [deleteRecord, setDeleteRecord] = useState<number[] | null>(null);
  const [show, setShow] = useState<boolean>(false);
  useEffect(() => {
    document.title = "Contact | Domiex - React TS Admin & Dashboard Template";
  }, []);

  useEffect(() => {
    if (contact === null) {
      dispatch(getContactData());
    } else {
      setContactList(contact);
    }
  }, [contact, dispatch]);

  const filteredData = contactList.filter(
    (item: CrmContactItems) =>
      item.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.company.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const openModal = (key: string) =>
    setModalState((prev) => ({ ...prev, [key]: true }));
  const closeModal = (key: string) =>
    setModalState((prev) => ({ ...prev, [key]: false }));

  // edit and add data

  const handleOpenModal = useCallback(
    (editMode: boolean = false, contact: CrmContactItems | null = null) => {
      setEditMode(editMode);
      setCurrentContact(contact);
      const modalKey = editMode ? "showEditContactForm" : "showAddContactForm";
      openModal(modalKey);
    },
    [],
  );

  const handleCloseModal = () => {
    const modalKey = editMode ? "showEditContactForm" : "showAddContactForm";
    closeModal(modalKey);
    setEditMode(false);
    setCurrentContact(null);
  };

  // delete

  const toggleDelete = () => {
    setShow(false);
    setDeleteRecord(null);
  };
  const onClickProjectDelete = (_id: number) => {
    setDeleteRecord([_id]);
    setShow(true);
  };

  const handleRemoveProject = () => {
    if (deleteRecord !== null) {
      dispatch(deleteContactListData(deleteRecord));
      setDeleteRecord(null);
      setShow(false);
    }
  };

  const handleSelectRecord = (id: number) => {
    setDeletedListData((prev) => {
      const updated = prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id];

      // Uncheck "Select All" if not all are selected
      if (updated.length !== filteredData.length) {
        setSelectAll(false);
      }

      return updated;
    });
  };

  const handleSelectAll = useCallback(() => {
    if (selectAll) {
      // If already selected all, unselect all
      setDeletedListData([]);
    } else {
      // Select all visible items
      setDeletedListData(filteredData.map((item) => item._id));
    }
    setSelectAll((prev) => !prev);
  }, [selectAll, filteredData]);

  const handleRemoveSelectedRecords = () => {
    dispatch(deleteContactListData(deletedListData));
    setDeletedListData([]);
    setSelectAll(false);
  };

  const getStatusClass = (status: string | undefined) => {
    switch (status) {
      case "Customer":
        return "badge badge-pink";
      case "Personal":
        return "badge badge-yellow";
      case "Employee":
        return "badge badge-sky";
      case "Marketing":
        return "badge badge-purple";
      default:
        return "badge";
    }
  };

  const columns = useMemo(
    () => [
      {
        header: (
          <input
            id="checkboxAll"
            className="input-check input-check-primary"
            type="checkbox"
            checked={selectAll}
            onChange={handleSelectAll}
          />
        ),
        accessorKey: "id",
        enableSorting: false,
        cell: ({ row }: any) => (
          <input
            className="input-check input-check-primary"
            type="checkbox"
            checked={deletedListData.includes(row.original._id)}
            onChange={() => handleSelectRecord(row.original._id)}
          />
        ),
      },
      {
        header: "ID",
        accessorKey: "contact_id",
      },
      {
        header: "Name",
        accessorKey: "contactName",
        cell: (value: any) => {
          return (
            <>
              <div className="flex items-center gap-2">
                <img
                  src={value.row.original.image}
                  alt="userimage"
                  className="rounded-full shrink-0 size-9"
                  height={36}
                  width={36}
                />
                <div className="grow">
                  <h6>
                    <Link
                      to="#!"
                      className="text-current link link-primary grow"
                    >
                      {value.getValue()}
                    </Link>
                  </h6>
                  <p className="text-sm text-gray-500 dark:text-dark-500">
                    {value.row.original.phoneNumber}
                  </p>
                </div>
              </div>
            </>
          );
        },
      },
      {
        header: "Company",
        accessorKey: "company",
      },
      {
        header: "Role",
        accessorKey: "role",
      },
      {
        header: "Email",
        accessorKey: "email",
      },
      {
        header: "Website",
        accessorKey: "website",
        cell: (value: any) => (
          <Link to="#!" className="badge badge-gray">
            {value.getValue()}
          </Link>
        ),
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
            <Dropdown
              position="right"
              trigger="click"
              dropdownClassName="dropdown"
            >
              <DropdownButton colorClass="flex items-center text-gray-500 dark:text-dark-500">
                <i className="ri-more-2-fill"></i>
              </DropdownButton>
              <DropdownMenu>
                <Link to="#!" className="dropdown-item ">
                  <i className="align-middle ltr:mr-2 rtl:ml-2 ri-eye-line"></i>{" "}
                  <span>Overview</span>
                </Link>

                <Link
                  to="#!"
                  className="dropdown-item "
                  onClick={(e) => {
                    e.preventDefault();
                    handleOpenModal(true, value.row.original);
                  }}
                >
                  <i className="align-middle ltr:mr-2 rtl:ml-2 ri-pencil-line"></i>{" "}
                  <span>Edit</span>
                </Link>
                <Link
                  to="#!"
                  className="dropdown-item"
                  onClick={(e) => {
                    e.preventDefault();
                    onClickProjectDelete(value.row.original._id);
                  }}
                >
                  <i className="align-middle ltr:mr-2 rtl:ml-2 ri-delete-bin-line"></i>{" "}
                  <span>Delete</span>
                </Link>
              </DropdownMenu>
            </Dropdown>
          </>
        ),
      },
    ],
    [selectAll, deletedListData, handleOpenModal, handleSelectAll],
  );

  // Pagination
  const itemsPerPage = 8;
  const [currentPage, setCurrentPage] = useState(1);
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const paginatedEvents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData && filteredData.length > 0
      ? filteredData.slice(startIndex, startIndex + itemsPerPage)
      : [];
  }, [filteredData, currentPage, itemsPerPage]);

  return (
    <React.Fragment>
      <BreadCrumb title="Contact" subTitle="CRM" />
      <div>
        <div className="card">
          {/* card header */}
          <div className="card-header">
            <div className="flex flex-wrap justify-between gap-5">
              <div>
                <div className="relative group/form">
                  <input
                    type="text"
                    className="ltr:pl-9 rtl:pr-9 form-input ltr:group-[&.right]/form:pr-9 rtl:group-[&.right]/form:pl-9 ltr:group-[&.right]/form:pl-4 rtl:group-[&.right]/form:pr-4"
                    placeholder="Search for ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <div className="absolute inset-y-0 flex items-center text-gray-500 dark:text-dark-500 ltr:left-3 rtl:right-3 ltr:group-[&.right]/form:right-3 rtl:group-[&.right]/form:left-3 ltr:group-[&.right]/form:left-auto rtl:group-[&.right]/form:right-auto focus:outline-none">
                    <Search className="size-4" />
                  </div>
                </div>
              </div>
              <div>
                <div className="flex flex-wrap gap-2">
                  {deletedListData.length > 0 && (
                    <button
                      className="btn btn-red btn-icon"
                      onClick={handleRemoveSelectedRecords}
                    >
                      <Trash className="inline-block size-4" />
                    </button>
                  )}
                  <button type="button" className="btn btn-sub-gray">
                    <Download className="inline-block size-4" />{" "}
                    <span className="align-baseline">Export</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={(e) => {
                      e.preventDefault();
                      openModal("showAddContactForm");
                    }}
                  >
                    <Plus className="inline-block size-4" />{" "}
                    <span className="align-baseline">Add Contact</span>
                  </button>
                  {/* dropdown */}
                </div>
              </div>
            </div>
          </div>

          {/* card body */}
          <div className="card-body">
            <div>
              <TableContainer
                columns={columns}
                data={paginatedEvents}
                thClassName="!font-medium cursor-pointer"
                isSearch={false}
                divClassName="overflow-x-auto"
                tableClassName="table whitespace-nowrap"
                PaginationClassName="pagination-container"
                thTrClassName="text-gray-500 bg-gray-100 dark:bg-dark-850 dark:text-dark-500"
                isTFooter={false}
              />
              {filteredData.length !== 0 && (
                <Pagination
                  totalItems={
                    filteredData && filteredData.length > 0
                      ? filteredData.length
                      : filteredData.length
                  }
                  itemsPerPage={itemsPerPage}
                  currentPage={currentPage}
                  onPageChange={handlePageChange}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Edit Delete Modal */}
      <AddEditCrmContact
        modalState={modalState}
        closeModal={handleCloseModal}
        contactList={contactList}
        editMode={editMode}
        currentContact={currentContact}
      />

      <Toaster
        position="top-right"
        reverseOrder={layoutDirection === LAYOUT_DIRECTION.RTL}
      />

      <DeleteModal
        show={show}
        handleHide={toggleDelete}
        deleteModalFunction={handleRemoveProject}
      />
    </React.Fragment>
  );
};

export default CrmContact;
