import DeleteModal from "@src/components/common/deleteModal";
import {
  Dropdown,
  DropdownButton,
  DropdownMenu,
} from "@src/components/custom/dropdown/dropdown";
import type { TodayAppointments } from "@src/dtos";
import { AppDispatch, RootState } from "@src/slices/reducer";
import {
  deleteTodayAppointmentsData,
  getTodayAppointmentsData,
} from "@src/slices/thunk";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import EditTodayAppointments from "./editTodayAppointments";
import { Link } from "react-router-dom";

const TodayAppointments = () => {
  //get
  const dispatch: AppDispatch = useDispatch();
  const { todaysAppointments } = useSelector(
    (state: RootState) => state.Appointments,
  );
  const [showAll, setShowAll] = useState(false);
  const [todaysAppointment, setTodaysAppointment] = useState<
    TodayAppointments[]
  >([]);
  const appointmentsToShow = showAll
    ? todaysAppointment
    : todaysAppointment.slice(0, 4);

  useEffect(() => {
    if (!todaysAppointments) {
      dispatch(getTodayAppointmentsData());
    } else {
      setTodaysAppointment(todaysAppointments);
    }
  }, [todaysAppointments, dispatch]);

  const toggleShowAll = () => {
    setShowAll((prev) => !prev);
  };

  const [dayAppointment, setDayAppointment] =
    useState<TodayAppointments | null>(null);

  const [show, setShow] = useState<boolean>(false);
  const toggleDelete = () => {
    setShow(false);
    setDayAppointment(null);
  };

  const onClickEventListDelete = (list: TodayAppointments) => {
    setDayAppointment(list);
    setShow(true);
  };

  const handleDeleteList = () => {
    if (dayAppointment) {
      dispatch(deleteTodayAppointmentsData([dayAppointment._id]));
      setShow(false);
    }
  };

  const [modalState, setModalState] = useState<{ [key: string]: boolean }>({
    showAddContactForm: false,
    showEditContactForm: false,
  });

  const openModal = (key: string) =>
    setModalState((prev) => ({ ...prev, [key]: true }));
  const closeModal = (key: string) =>
    setModalState((prev) => ({ ...prev, [key]: false }));

  const [editMode, setEditMode] = useState(false);

  const [currentEvent, setCurrentEvent] = useState<TodayAppointments | null>(
    null,
  );

  const handleOpenModal = (
    editMode: boolean = false,
    event: TodayAppointments | null = null,
  ) => {
    setEditMode(editMode);
    setCurrentEvent(event);
    const modalKey = editMode ? "showEditContactForm" : "showAddContactForm";
    openModal(modalKey);
  };

  const handleCloseModal = () => {
    const modalKey = editMode ? "showEditContactForm" : "showAddContactForm";
    closeModal(modalKey);
    setEditMode(false);
    setCurrentEvent(null);
  };

  return (
    <React.Fragment>
      <div className="flex mb-5">
        <h6 className="grow">Today Appointments</h6>
        <Link
          to="#"
          className="underline link link-primary shrink-0"
          onClick={toggleShowAll}
        >
          {showAll ? "Show Less" : "Show All"}
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-x-space">
        {appointmentsToShow.map((item, index) => (
          <div className="card" key={index}>
            <div className="card-body">
              <div className="flex">
                <div className="grow">
                  <img
                    src={item.image}
                    alt="itemImg"
                    height={48}
                    width={48}
                    className="rounded-lg size-12"
                  />
                </div>
                <Dropdown position="" trigger="click">
                  <DropdownButton colorClass="link link-primary">
                    <i className="ri-more-fill"></i>
                  </DropdownButton>
                  <DropdownMenu>
                    <Link to="#" className="dropdown-item">
                      Overview
                    </Link>
                    <Link
                      to="#"
                      className="dropdown-item"
                      onClick={(e) => {
                        e.preventDefault();
                        handleOpenModal(true, item);
                      }}
                    >
                      Edit
                    </Link>
                    <button
                      className="dropdown-item"
                      onClick={(e) => {
                        e.preventDefault();
                        onClickEventListDelete(item);
                      }}
                    >
                      Delete
                    </button>
                  </DropdownMenu>
                </Dropdown>
              </div>
              <div className="mt-4">
                <h6 className="mb-1">
                  <Link to="#!">{item.patientName}</Link>
                </h6>
                <p className="text-gray-500 dark:text-dark-500">
                  {item.treatment}
                </p>
              </div>
              <div className="flex mt-5 text-gray-500 dark:text-dark-500">
                <p className="grow">
                  <i className="align-baseline ltr:mr-1 rtl:ml-1 ri-calendar-event-line"></i>
                  {item.date}
                </p>
                <p>
                  <i className="align-baseline ltr:mr-1 rtl:ml-1 ri-time-line"></i>
                  {item.startTime} - {item.endTime}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <DeleteModal
        show={show}
        handleHide={toggleDelete}
        deleteModalFunction={handleDeleteList}
      />
      <EditTodayAppointments
        modalState={modalState}
        closeModal={handleCloseModal}
        eventList={todaysAppointment}
        editMode={editMode}
        currentContact={currentEvent}
      />
    </React.Fragment>
  );
};

export default TodayAppointments;
