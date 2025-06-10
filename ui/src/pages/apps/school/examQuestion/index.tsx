import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Search, Trash2 } from "lucide-react";
import TableContainer from "@src/components/custom/table/Table";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@src/slices/reducer";
import type { ExamQuestion, NextPageWithLayout } from "@src/dtos";
import {
  Dropdown,
  DropdownButton,
  DropdownMenu,
} from "@src/components/custom/dropdown/dropdown";
import Pagination from "@src/components/common/pagination";
import DeleteModal from "@src/components/common/deleteModal";
import Select from "react-select";
import BreadCrumb from "@src/components/common/breadCrumb";
import { deleteQuestionListData, getQuestionListData } from "@src/slices/thunk";
import { Link } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { LAYOUT_DIRECTION } from "@src/components/constants/layout";
import AddEditQuestion from "@src/views/apps/school/examQuestion/addEditQuestion";
import OverViewModal from "@src/views/apps/school/examQuestion/overViewModal";

interface OptionType {
  label: string;
  value: string;
}

const categoryItems: OptionType[] = [
  { label: "All", value: "All" },
  { label: "MCQ", value: "MCQ" },
  { label: "Q & A", value: "Q & A" },
  { label: "Hard", value: "Hard" },
  { label: "Normal", value: "Normal" },
  { label: "Medium", value: "Medium" },
];

const QuestionExam: NextPageWithLayout = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { examQuestion } = useSelector(
    (state: RootState) => state.ExamQuestionList,
  );
  const { layoutDirection } = useSelector((state: RootState) => state.Layout);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [questionListData, setQuestionListData] = useState<ExamQuestion[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<OptionType | null>(
    null,
  );
  const [modalState, setModalState] = useState<{ [key: string]: boolean }>({
    showAddStaffForm: false,
    showEditStaffForm: false,
  });
  const [editMode, setEditMode] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<ExamQuestion | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooks, setSelectedBooks] = useState<ExamQuestion | null>(null);
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

  useEffect(() => {
    document.title = "Questions | Domiex - React TS Admin & Dashboard Template";
  }, []);

  useEffect(() => {
    if (!examQuestion) {
      dispatch(getQuestionListData());
    } else {
      setQuestionListData(examQuestion);
    }
  }, [examQuestion, dispatch]);

  const handleSelectRecord = useCallback((_id: number) => {
    setSelectedItems((prev) =>
      prev.includes(_id) ? prev.filter((item) => item !== _id) : [...prev, _id],
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedItems.length === questionListData.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(questionListData.map((question) => question._id));
    }
  }, [selectedItems, questionListData]);

  const handleDeleteList = () => {
    dispatch(deleteQuestionListData(selectedItems));
    setSelectedItems([]);
  };

  const handleDeleteModalToggle = () => {
    setShowDeleteModal((prev) => !prev);
  };

  const handleCategoryChange = (selectedOption: OptionType | null) => {
    setSelectedCategory(selectedOption);
  };

  const handleOpenModal = (
    editMode: boolean = false,
    question: ExamQuestion | null = null,
  ) => {
    setEditMode(editMode);
    setCurrentQuestion(question);
    const modalKey = editMode ? "showEditStaffForm" : "showAddStaffForm";
    setModalState((prev) => ({ ...prev, [modalKey]: true }));
  };

  const handleCloseModal = () => {
    const modalKey = editMode ? "showEditStaffForm" : "showAddStaffForm";
    setModalState((prev) => ({ ...prev, [modalKey]: false }));
    setEditMode(false);
    setCurrentQuestion(null);
  };
  const toggleQuestion = useCallback((rowId: number) => {
    setExpandedRows((prevExpandedRows) => ({
      ...prevExpandedRows,
      [rowId]: !prevExpandedRows[rowId],
    }));
  }, []);

  const handleHide = () => {
    setIsModalOpen(false);
    setSelectedBooks(null);
  };

  const onClickOverview = (book: ExamQuestion) => {
    setSelectedBooks(book);
    setIsModalOpen(true);
  };

  const filteredQuestions =
    questionListData &&
    questionListData.filter((question) => {
      const matchesQuery = question.question
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        !selectedCategory ||
        selectedCategory.value === "All" ||
        question.type === selectedCategory.value;
      return matchesQuery && matchesCategory;
    });

  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedQuestions = filteredQuestions.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const columns = useMemo(
    () => [
      {
        header: (
          <input
            type="checkbox"
            className="input-check input-check-primary"
            checked={selectedItems.length === questionListData.length}
            onChange={handleSelectAll}
          />
        ),
        accessorKey: "select",
        cell: ({ row }: any) => (
          <input
            type="checkbox"
            checked={selectedItems.includes(row.original._id)}
            onChange={() => handleSelectRecord(row.original._id)}
            className="input-check input-check-primary"
          />
        ),
      },
      {
        header: "Questions",
        accessorKey: "question",
        cell: ({ row }: any) => (
          <>
            <h6>
              <Link to="#!">{row.original.question}</Link>
            </h6>
            {expandedRows[row._id] && (
              <div className="mt-3 space-y-2">
                {row.original.options.map((option: any, index: number) => (
                  <div className="input-radio-group" key={index}>
                    <input
                      id={`qOption${row.original.options._id}${index}`}
                      className="hidden input-radio peer"
                      type="radio"
                      name={`optionQ${row.original.options._id}`}
                    />
                    <label
                      htmlFor={`qOption${row.original.options._id}${index}`}
                      className="flex items-center justify-center border border-gray-200 rounded-md text-15 size-9 peer-checked:bg-primary-500 peer-checked:border-primary-500 peer-checked:text-white"
                    >
                      {String.fromCharCode(65 + index)}
                    </label>
                    <label
                      htmlFor={`qOption${row.original.options._id}${index}`}
                      className="py-1.5 px-3 rounded-md border border-gray-200 input-radio-label grow"
                    >
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </>
        ),
      },
      {
        header: "Options",
        accessorKey: "",
        cell: ({ row }: any) => (
          <span
            className="link link-primary"
            onClick={() => toggleQuestion(row._id)}
          >
            <span>{expandedRows[row._id] ? "Hide" : "Show"}</span>
          </span>
        ),
      },
      {
        header: "Item Type",
        accessorKey: "type",
      },
      {
        header: "Difficulty",
        accessorKey: "difficulty",
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: ({ row }: any) => {
          const { status } = row.original;
          return (
            <span
              className={`badge ${
                status === "New" ? "badge-green" : "badge-gray"
              }`}
            >
              {status}
            </span>
          );
        },
      },
      {
        header: "Action",
        accessorKey: "",
        cell: ({ row }: any) => (
          <Dropdown
            position="right"
            trigger="click"
            dropdownClassName="dropdown"
          >
            <DropdownButton colorClass="flex items-center text-gray-500">
              <i className="ri-more-2-fill"></i>
            </DropdownButton>
            <DropdownMenu>
              <Link
                to="#!"
                className="flex items-center px-4 py-1.5 text-gray-500 hover:text-primary-500"
                onClick={() => onClickOverview(row.original)}
              >
                <span>Overview</span>
              </Link>
              <Link
                to="#!"
                className="flex items-center px-4 py-1.5 text-gray-500 hover:text-primary-500"
                onClick={(e) => {
                  e.preventDefault();
                  handleOpenModal(true, row.original);
                }}
              >
                <span>Edit</span>
              </Link>
              <Link
                to="#!"
                className="flex items-center px-4 py-1.5 text-gray-500 hover:text-red-500"
                onClick={(e) => {
                  e.preventDefault();
                  handleSelectRecord(row.original._id);
                  handleDeleteModalToggle();
                }}
              >
                <span>Delete</span>
              </Link>
            </DropdownMenu>
          </Dropdown>
        ),
      },
    ],
    [
      expandedRows,
      handleSelectAll,
      handleSelectRecord,
      questionListData,
      selectedItems,
      toggleQuestion,
    ],
  );

  return (
    <React.Fragment>
      <BreadCrumb title="Question" subTitle="School" />
      <div className="grid grid-cols-12 gap-5 gap-x-space mb-space">
        <div className="col-span-12 md:col-span-6 xl:col-span-4">
          <div className="relative flex items-center">
            <input
              type="text"
              className="border-r-0 rounded-r-none form-input grow focus:border-green-200"
              placeholder="Search for ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="border-green-200 rounded-l-none btn btn-sub-green btn-icon shrink-0">
              <Search className="size-5" />
            </button>
          </div>
        </div>
        {selectedItems.length > 0 && (
          <button
            className="btn btn-red btn-icon"
            onClick={handleDeleteModalToggle}
          >
            <Trash2 className="inline-block size-4" />
          </button>
        )}
        <div className="col-span-12 sm:col-span-6 md:col-span-2 xl:col-start-9">
          <div id="sortBySelect">
            <Select
              classNamePrefix="select"
              options={categoryItems}
              value={selectedCategory}
              onChange={handleCategoryChange}
              placeholder="Sort By"
            />
          </div>
        </div>
        <div className="col-span-12 sm:col-span-6 md:col-span-4 xl:col-span-2">
          <button
            type="button"
            className="w-full btn btn-primary"
            onClick={() => handleOpenModal(false)}
          >
            Create New Question
          </button>
        </div>
      </div>

      <div>
        <TableContainer
          columns={columns}
          data={paginatedQuestions}
          tdClassName="self-start align-top border-t ltr:last:border-r rtl:last:border-l ltr:first:border-l rtl:first:border-r ltr:last:rounded-r-md rtl:last:rounded-l-md ltr:first:rounded-l-md rtl:first:rounded-r-md"
          thClassName="!font-medium cursor-pointer"
          divClassName="overflow-x-auto"
          tableClassName="table border-separate border-spacing-y-2 whitespace-nowrap"
          thTrClassName="font-medium text-gray-500"
        />
        <Pagination
          totalItems={filteredQuestions.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      </div>
      {/* <ToastContainer /> */}
      <DeleteModal
        show={showDeleteModal}
        handleHide={handleDeleteModalToggle}
        deleteModalFunction={handleDeleteList}
      />
      <AddEditQuestion
        modalState={modalState}
        closeModal={handleCloseModal}
        questionList={questionListData}
        editMode={editMode}
        currentQuestion={currentQuestion}
      />

      {selectedBooks && (
        <OverViewModal
          show={isModalOpen}
          handleHide={handleHide}
          book={selectedBooks}
        />
      )}

      <Toaster
        position={"top-right"}
        reverseOrder={layoutDirection === LAYOUT_DIRECTION.RTL}
      />
    </React.Fragment>
  );
};

export default QuestionExam;
