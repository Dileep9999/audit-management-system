import {
  Dropdown,
  DropdownButton,
  DropdownMenu,
} from "@src/components/custom/dropdown/dropdown";
import { AppDispatch, RootState } from "@src/slices/reducer";
import { Plus, SlidersHorizontal } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AddEditEventGrid from "@src/views/apps/event/addEditEventGrid";
import Pagination from "@src/components/common/pagination";
import BookNow from "@src/views/apps/event/overview/bookNow";
import { EventGrid, NextPageWithLayout } from "@src/dtos";
import BreadCrumb from "@src/components/common/breadCrumb";
import { LAYOUT_DIRECTION } from "@src/components/constants/layout";
import { Link } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import {
  deleteEventGridtData,
  getEventGridData,
} from "@src/slices/events/grid/thunk";

const GridList: NextPageWithLayout = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { eventGrid } = useSelector((state: RootState) => state.EventGrid);
  const { layoutDirection } = useSelector((state: RootState) => state.Layout);
  const [eventGridData, setEventGridData] = useState<EventGrid[]>([]);
  const [modalState, setModalState] = useState<{ [key: string]: boolean }>({
    showAddEventGridForm: false,
    showEditEventGridForm: false,
  });

  useEffect(() => {
    document.title = "Grid List | Domiex - React TS Admin & Dashboard Template";
  }, []);

  //get
  useEffect(() => {
    if (!eventGrid) {
      dispatch(getEventGridData());
    } else {
      setEventGridData(eventGrid);
    }
  }, [eventGrid, dispatch]);
  const handleDelete = (_id: number) => {
    dispatch(deleteEventGridtData([_id]));
  };

  const openModal = (key: string) =>
    setModalState((prev) => ({ ...prev, [key]: true }));
  const closeModal = (key: string) =>
    setModalState((prev) => ({ ...prev, [key]: false }));
  const [editMode, setEditMode] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<EventGrid | null>(null);

  const handleOpenModal = (
    editMode: boolean = false,
    event: EventGrid | null = null,
  ) => {
    setEditMode(editMode);
    setCurrentEvent(event);
    const modalKey = editMode
      ? "showEditEventGridForm"
      : "showAddEventGridForm";
    openModal(modalKey);
  };

  const handleCloseModal = () => {
    const modalKey = editMode
      ? "showEditEventGridForm"
      : "showAddEventGridForm";
    closeModal(modalKey);
    setEditMode(false);
    setCurrentEvent(null);
  };

  const getDayName = (date: Date | null): string => {
    if (!date) return "";
    const options: Intl.DateTimeFormatOptions = { weekday: "long" };
    return new Intl.DateTimeFormat("en-US", options).format(date);
  };

  const getDayOfDate = (dateString: string): string => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    return day;
  };

  //bookmodal
  const [show, setShow] = useState(false);

  const handleModal = () => {
    setShow(!show);
  };

  // pagination
  const itemsPerPage = 6;
  const [currentPage, setCurrentPage] = useState(1);
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEvents = eventGridData.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  //sorting
  const [sortOption, setSortOption] = useState("none");
  type SortOption = "none" | "eventNameAsc" | "eventNameDesc" | "status";
  const handleSort = (option: SortOption) => {
    const sortedList = [...eventGridData];
    switch (option) {
      case "eventNameAsc":
        sortedList.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "eventNameDesc":
        sortedList.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "status":
        sortedList.sort((a, b) => a.status.localeCompare(b.status));
        break;
      default:
        break;
    }
    setSortOption(option);
    setEventGridData(sortedList);
  };

  return (
    <React.Fragment>
      <BreadCrumb title="Grid View" subTitle="Events" />
      <div>
        <div className="flex flex-wrap items-center gap-5">
          <h6 className="grow">
            Event Listings (<span>{eventGridData.length}</span>)
          </h6>
          <div className="flex items-center gap-2 shrink-0">
            <Dropdown
              position="right"
              trigger="click"
              dropdownClassName="dropdown"
            >
              <DropdownButton colorClass="btn btn-sub-gray btn-icon btn-icon-text">
                <SlidersHorizontal className="size-4" />
              </DropdownButton>
              <DropdownMenu>
                <button
                  onClick={() => handleSort("none")}
                  className="dropdown-item text-start"
                >
                  <span>No Sorting</span>
                </button>
                <button
                  onClick={() => handleSort("eventNameAsc")}
                  className="dropdown-item text-start"
                >
                  <span>Alphabetical (A -&gt; Z)</span>
                </button>
                <button
                  onClick={() => handleSort("eventNameDesc")}
                  className="dropdown-item text-start"
                >
                  <span>Reverse Alphabetical (Z -&gt; A)</span>
                </button>
                <button
                  onClick={() => handleSort("status")}
                  className="dropdown-item text-start"
                >
                  <span>Status</span>
                </button>
              </DropdownMenu>
            </Dropdown>
            <button
              className="btn btn-primary shrink-0"
              data-modal-target="addEventModal"
            >
              <Plus className="inline-block size-4 me-1" />
              <span
                className="align-baseline"
                onClick={() => openModal("showAddEventGridForm")}
              >
                Add New Event
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 mt-5 md:grid-cols-2 xl:grid-cols-3 gap-x-space">
          {(paginatedEvents || sortOption).map((event, index) => {
            return (
              <div key={index} className="card">
                <div className="card-body">
                  <div className="flex items-center gap-3">
                    <img
                      src={event.image}
                      alt="eventImg"
                      className="rounded-full size-12 shrink-0"
                      width={48}
                      height={48}
                    />
                    <div className="grow">
                      <h6 className="mb-1">
                        <Link to="#!"></Link>
                        {event.username}
                      </h6>
                      <p className="text-sm text-gray-500 dark:text-dark-500">
                        {getDayName(new Date(event.date))
                          .toString()
                          .slice(0, 3)}{" "}
                        {event.date}, {event.time}
                      </p>
                    </div>
                    <Dropdown
                      position=""
                      trigger="click"
                      dropdownClassName="dropdown"
                      isActive
                    >
                      <DropdownButton colorClass="flex items-center text-gray-500 dark:text-dark-500">
                        <i className="ri-more-fill"></i>
                      </DropdownButton>
                      <DropdownMenu>
                        <Link
                          to="/apps/events/overview"
                          className="dropdown-item"
                        >
                          <i className="align-middle ltr:mr-2 rtl:ml-2 ri-eye-line"></i>{" "}
                          <span>Overview</span>
                        </Link>
                        <Link
                          to="#!"
                          data-modal-target="addEventModal"
                          className="dropdown-item"
                          onClick={(e) => {
                            e.preventDefault();
                            handleOpenModal(true, event);
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
                            handleDelete(event._id);
                          }}
                        >
                          <i className="align-middle ltr:mr-2 rtl:ml-2 ri-delete-bin-line"></i>{" "}
                          <span>Delete</span>
                        </Link>
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                  <div className="mt-5">
                    <img
                      src={event.mainImage}
                      alt="mainImage"
                      className="object-cover w-full h-48 rounded-md"
                      width={402}
                      height={192}
                    />
                  </div>
                  <div className="flex gap-3 mt-5">
                    <div>
                      <div className="flex flex-col items-center justify-center mx-auto mb-2.5 border bg-red-500/20 rounded-md border-red-500/20 size-16 text-red-500">
                        <p className="mb-0.5">
                          {getDayName(new Date(event.date))
                            .toString()
                            .slice(0, 3)}
                        </p>
                        <h3 className="leading-none">
                          {getDayOfDate(event.date)}
                        </h3>
                      </div>
                      <button
                        type="button"
                        data-modal-target="bookEventModal"
                        className="btn btn-primary"
                        onClick={handleModal}
                      >
                        Book
                      </button>
                    </div>
                    <div>
                      <h6 className="mb-1">
                        <Link
                          to="#!"
                          className="text-current link link-primary"
                        >
                          {event.name}
                        </Link>
                      </h6>
                      <p className="mb-2 text-gray-500 dark:text-dark-500">
                        <span>{event.date}</span>
                        <span className="ltr:pl-2 rtl:pr-2 ltr:ml-1.5 rtl:mr-1.5 ltr:border-l rtl:border-r border-gray-200 dark:border-dark-800">
                          {event.location}
                        </span>
                      </p>
                      <p className="mb-1 text-gray-500 dark:text-dark-500">
                        Contributors
                      </p>
                      <div className="flex mx-3 -space-x-3 grow rtl:space-x-reverse">
                        {event.contributors.map((contributors, index) => {
                          return (
                            <Link
                              key={index}
                              to="#!"
                              className="transition duration-300 ease-linear hover:z-10"
                              title="avatar link"
                            >
                              <img
                                className="border-2 border-white rounded-full size-8 dark:border-dark-900"
                                src={contributors.image}
                                alt="contributorsImg"
                                height={32}
                                width={32}
                              />
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mb-5">
          <Pagination
            totalItems={eventGridData.length}
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
      <AddEditEventGrid
        modalState={modalState}
        closeModal={handleCloseModal}
        eventGridList={eventGridData}
        editMode={editMode}
        currentGridEvent={currentEvent}
      />

      <BookNow show={show} closedModal={handleModal} />
    </React.Fragment>
  );
};

export default GridList;
