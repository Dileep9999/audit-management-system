import { Plus, Search } from "lucide-react";
import React, { ChangeEvent, useEffect, useState } from "react";

import SimpleBar from "simplebar-react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DraggableProvided,
  DroppableProvided,
} from "@hello-pangea/dnd";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@src/slices/reducer";
import { deleteLeadData, getLeadData } from "@src/slices/thunk";
import DeleteModal from "@src/components/common/deleteModal";
import AddEditCrmLead from "@src/views/apps/crm/addEditCrmLead";
import { LeadItem, NextPageWithLayout } from "@src/dtos";
import BreadCrumb from "@src/components/common/breadCrumb";
import { LAYOUT_DIRECTION } from "@src/components/constants/layout";
import { Link } from "react-router-dom";
import { Toaster } from "react-hot-toast";

interface ModalState {
  showAddLeadForm: boolean;
  showEditLeadForm: boolean;
}

const CrmLead: NextPageWithLayout = () => {
  const dispatch: AppDispatch = useDispatch();

  // get data
  const { lead } = useSelector((state: RootState) => state.Lead);
  const { layoutDirection } = useSelector((state: RootState) => state.Layout);
  const [searchTerm, setSearchTerm] = useState("");
  const [leads, setLeads] = useState<number[] | null>(null);
  const [show, setShow] = useState<boolean>(false);
  const [leadList, setLeadList] = useState<LeadItem[]>([]);
  const [modalState, setModalState] = useState<ModalState>({
    showAddLeadForm: false,
    showEditLeadForm: false,
  });
  const [editMode, setEditMode] = useState(false);
  const [currentLead, setCurrentLead] = useState<LeadItem | null>(null);
  useEffect(() => {
    document.title = "Leads | Domiex - React TS Admin & Dashboard Template";
  }, []);

  useEffect(() => {
    if (!lead) {
      dispatch(getLeadData());
    } else {
      setLeadList(lead);
    }
  }, [lead, dispatch]);

  // Group items by status
  const groupedItems = leadList.reduce((acc: any, item: any) => {
    if (!acc[item.status]) {
      acc[item.status] = [];
    }
    acc[item.status].push(item);
    return acc;
  }, {});

  const onDragEnd = (result: any) => {
    const { source, destination } = result;
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }
    const sourceStatus = source.droppableId;
    const destinationStatus = destination.droppableId;
    const draggedItem = leadList.find(
      (item) =>
        item.status === sourceStatus &&
        item._id === groupedItems[sourceStatus][source.index]._id,
    );

    if (!draggedItem) return;
    const updatedItem = { ...draggedItem, status: destinationStatus };
    const updatedSourceGroup = [...groupedItems[sourceStatus]];
    updatedSourceGroup.splice(source.index, 1);
    const updatedDestinationGroup = [...groupedItems[destinationStatus]];
    updatedDestinationGroup.splice(destination.index, 0, updatedItem);
    const updatedLeadList = [
      ...leadList.filter(
        (item) =>
          item.status !== sourceStatus && item.status !== destinationStatus,
      ),
      ...updatedSourceGroup,
      ...updatedDestinationGroup,
    ];
    setLeadList(updatedLeadList);
  };

  const statusOrders = ["New", "Hot", "Pending", "Lost"];
  const statusClasses = [
    "badge-sky",
    "badge-red",
    "badge-green",
    "badge-purple",
  ];

  const toggleDelete = () => {
    setShow(false);
    setLeads(null);
  };

  const onClickLeadDelete = (_id: number) => {
    setLeads([_id]);
    setShow(true);
  };

  const handleDeleteLead = () => {
    if (leads) {
      dispatch(deleteLeadData(leads));
      setShow(false);
    }
  };

  const openModal = (key: string) =>
    setModalState((prev) => ({ ...prev, [key]: true }));
  const closeModal = (key: string) =>
    setModalState((prev) => ({ ...prev, [key]: false }));

  const handleOpenModal = (
    editMode: boolean = false,
    lead: LeadItem | null = null,
  ) => {
    setEditMode(editMode);
    setCurrentLead(lead);
    const modalKey = editMode ? "showEditLeadForm" : "showAddLeadForm";
    openModal(modalKey);
  };

  const handleCloseModal = () => {
    const modalKey = editMode ? "showEditLeadForm" : "showAddLeadForm";
    closeModal(modalKey);
    setEditMode(false);
    setCurrentLead(null);
  };
  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (e.target.value.trim() === "") {
      setLeadList(lead);
      return;
    } else {
      const filteredData = leadList.filter(
        (item: LeadItem) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setLeadList(filteredData);
    }
  };

  return (
    <React.Fragment>
      <BreadCrumb title="Lead" subTitle="CRM" />
      <div>
        <div className="card">
          <div className="card-header">
            <div className="grid grid-cols-12 gap-5">
              <div className="col-span-12 lg:col-span-6 xl:col-span-9">
                <div className="relative group/form w-full xl:max-w-[300px]">
                  <input
                    type="text"
                    className="ltr:pl-9 rtl:pr-9 form-input ltr:group-[&.right]/form:pr-9 rtl:group-[&.right]/form:pl-9 ltr:group-[&.right]/form:pl-4 rtl:group-[&.right]/form:pr-4"
                    placeholder="Search for leads..."
                    value={searchTerm}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleSearch(e)
                    }
                  />
                  <div className="absolute inset-y-0 flex items-center text-gray-500 dark:text-dark-500 ltr:left-3 rtl:right-3 ltr:group-[&.right]/form:right-3 rtl:group-[&.right]/form:left-3 ltr:group-[&.right]/form:left-auto rtl:group-[&.right]/form:right-auto focus:outline-none">
                    <Search className="size-4" />
                  </div>
                </div>
              </div>
              <div className="col-span-12 lg:col-span-6 xl:col-span-3">
                <div className="justify-end gap-2 sm:flex">
                  <button
                    type="button"
                    className="mt-2 btn btn-primary shrink-0 sm:mt-0"
                    onClick={() => openModal("showAddLeadForm")}
                  >
                    <Plus className="inline-block size-4" />
                    <span className="align-baseline"> Add Lead</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* lead */}
          <div className="card-body">
            <SimpleBar>
              <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex space-x-4">
                  {statusOrders.map((status, i) => {
                    const leadsByStatus = groupedItems[status] || [];

                    return (
                      <Droppable key={status} droppableId={status}>
                        {(provided: DroppableProvided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className="w-[350px] shrink-0 bg-gray-100 p-5 rounded-md dark:bg-dark-850"
                          >
                            <h6 className="mb-4">
                              {status}
                              <span
                                className={`badge ${statusClasses[i]} mx-2`}
                              >
                                {leadsByStatus.length}
                              </span>
                            </h6>
                            <SimpleBar
                              style={{ maxHeight: "calc(100vh - 25.1rem)" }}
                              className=" -mx-5 px-5"
                            >
                              <div
                                className="flex flex-col gap-2"
                                id="leads-container"
                                data-status={status}
                              >
                                {leadsByStatus.map((item: any, index: any) => (
                                  <Draggable
                                    key={index}
                                    draggableId={item._id.toString()}
                                    index={index}
                                  >
                                    {(provided: DraggableProvided) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                      >
                                        <div className="p-3 bg-white border border-white rounded-sm dark:bg-dark-900 dark:border-dark-900">
                                          <div className="flex items-center gap-3 mb-4">
                                            <div className="rounded-full size-12">
                                              <img
                                                src={item.image}
                                                alt="userImg"
                                                className="rounded-full"
                                                width={48}
                                                height={48}
                                              />
                                            </div>
                                            <div className="grow">
                                              <h6 className="mb-1">
                                                {item.name}
                                              </h6>
                                              <p className="text-sm text-gray-500 dark:text-dark-500">
                                                <i className="ri-time-line"></i>{" "}
                                                <span>{item.date}</span> at{" "}
                                                <span>{item.time}</span>
                                              </p>
                                            </div>
                                          </div>
                                          <p className="mb-2">
                                            <i className="ltr:mr-1 rtl:ml-1 ri-mail-line"></i>{" "}
                                            <span className="text-gray-500 dark:text-dark-500">
                                              {item.email}
                                            </span>
                                          </p>
                                          <p>
                                            <i className="ltr:mr-1 rtl:ml-1 ri-phone-line"></i>{" "}
                                            <span className="text-gray-500 dark:text-dark-500">
                                              {item.phoneNumber}
                                            </span>
                                          </p>
                                          <div className="flex items-center gap-3 mt-3">
                                            <Link
                                              to="#!"
                                              className="link link-primary"
                                              onClick={(e) => {
                                                e.preventDefault();
                                                handleOpenModal(true, item);
                                              }}
                                            >
                                              Edit
                                            </Link>
                                            <Link
                                              to="#!"
                                              className="link link-red"
                                              onClick={(e) => {
                                                e.preventDefault();
                                                onClickLeadDelete(item._id);
                                              }}
                                            >
                                              Delete
                                            </Link>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                              </div>
                            </SimpleBar>
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    );
                  })}
                </div>
              </DragDropContext>
              {/* } */}
            </SimpleBar>
          </div>
        </div>
      </div>

      <Toaster
        position="top-right"
        reverseOrder={layoutDirection === LAYOUT_DIRECTION.RTL}
      />

      {/* modals */}
      <AddEditCrmLead
        modalState={modalState}
        closeModal={handleCloseModal}
        leadList={leadList}
        editMode={editMode}
        currentLead={currentLead}
      />

      <DeleteModal
        show={show}
        handleHide={toggleDelete}
        deleteModalFunction={handleDeleteLead}
      />
    </React.Fragment>
  );
};

export default CrmLead;
