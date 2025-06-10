import { AppDispatch, RootState } from "@src/slices/reducer";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NextPageWithLayout, StudentList } from "@src/dtos";
import { CirclePlus, Search } from "lucide-react";
import TableContainer from "@src/components/custom/table/Table";
import Pagination from "@src/components/common/pagination";
import DeleteModal from "@src/components/common/deleteModal";
import Select from "react-select";
import BreadCrumb from "@src/components/common/breadCrumb";
import { Link, useNavigate } from "react-router-dom";
import {
  deleteStudentListData,
  getStudentListData,
  modifyCurrentStudent,
} from "@src/slices/thunk";
import { Toaster } from "react-hot-toast";
import { LAYOUT_DIRECTION } from "@src/components/constants/layout";

interface OptionType {
  label: string;
  value: string;
}

const studentStd: OptionType[] = [
  { label: "12 (A)", value: "12 (A)" },
  { label: "12 (B)", value: "12 (B)" },
  { label: "11 (A)", value: "11 (A)" },
  { label: "11 (B)", value: "11 (B)" },
  { label: "10 (A)", value: "10 (A)" },
  { label: "10 (B)", value: "10 (B)" },
  { label: "9", value: "9" },
  { label: "8", value: "8" },
];

const StudentsList: NextPageWithLayout = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { studentList } = useSelector((state: RootState) => state.StudentList);
  const { layoutDirection } = useSelector((state: RootState) => state.Layout);

  const navigate = useNavigate();
  const [studentListData, setStudentListData] = useState<StudentList[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [show, setShow] = useState<boolean>(false);
  const [event, setEvent] = useState<StudentList | null>(null);
  const [selectedStudentStd, setSelectedStudentStd] =
    useState<OptionType | null>(null);

  useEffect(() => {
    document.title = "List View | Domiex - React TS Admin & Dashboard Template";
  }, []);

  useEffect(() => {
    if (studentList === null) {
      dispatch(getStudentListData());
    } else {
      setStudentListData(studentList);
    }
  }, [studentList, dispatch]);

  const toggleDelete = () => {
    setShow(false);
    setEvent(null);
  };

  const handleDeleteList = () => {
    if (event) {
      dispatch(deleteStudentListData([event._id]));
      setShow(false);
    }
  };

  const onClickEventListDelete = (list: StudentList) => {
    setEvent(list);
    setShow(true);
  };

  const handleEdit = useCallback(
    (data: StudentList) => {
      dispatch(modifyCurrentStudent(data, true));
      navigate("/apps/school/students-admission");
    },
    [dispatch, navigate],
  );

  //filter
  const handleSearch = (e: any) => {
    setSearchQuery(e.target.value);
  };

  const handleStudentStd = (selectedOption: OptionType | null) => {
    setSelectedStudentStd(selectedOption);
  };

  const filterStudent = studentListData.filter((student) => {
    const searchStudent = student.studentName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesType =
      !selectedStudentStd ||
      selectedStudentStd.value === "All" ||
      student.class === selectedStudentStd.value;
    return searchStudent && matchesType;
  });

  // pagination
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEvents = filterStudent.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const columns = useMemo(
    () => [
      {
        header: "ID",
        accessorKey: "studentId",
      },
      {
        header: "Student Name",
        accessorKey: "studentName",
        cell: ({ row }: any) => {
          const { image, studentName, lastName } = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="relative text-gray-500 bg-gray-100 rounded-full dark:text-dark-500 dark:bg-dark-850 size-8">
                {image ? (
                  <img
                    src={image}
                    alt="image"
                    className="rounded-full"
                    style={{ width: "32px", height: "32px" }}
                    width={32}
                    height={32}
                  />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-gray-500 bg-gray-100 rounded-full dark:text-dark-500 dark:bg-dark-850">
                    {studentName.charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <h6>
                  <Link to="/apps/school/students-overview">
                    {studentName} {lastName}
                  </Link>
                </h6>
              </div>
            </div>
          );
        },
      },
      {
        header: "Gender",
        accessorKey: "gender",
      },
      {
        header: "Roll No",
        accessorKey: "rollNo",
      },
      {
        header: "Class",
        accessorKey: "class",
      },
      {
        header: "Phone",
        accessorKey: "phone",
      },
      {
        header: "Email",
        accessorKey: "email",
      },
      {
        header: "Birth Of Date",
        accessorKey: "birthDate",
      },
      {
        header: "Joining Date",
        accessorKey: "date",
      },
      {
        header: "Action",
        accessorKey: "",
        cell: (value: any) => (
          <div className="flex items-center gap-2">
            <button
              className="btn btn-sub-primary btn-icon !size-8"
              onClick={() => {
                handleEdit(value.row.original);
              }}
            >
              <i className="ri-pencil-line"></i>
            </button>
            <button
              className="btn btn-sub-red btn-icon !size-8"
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
    [handleEdit],
  );

  return (
    <React.Fragment>
      <BreadCrumb title="List View" subTitle="Students" />
      <div className="grid grid-cols-12 gap-x-space">
        <div className="col-span-12 card">
          <div className="card-header">
            <div className="flex flex-wrap justify-between gap-5">
              <div>
                <div className="relative group/form grow">
                  <input
                    type="text"
                    className="ltr:pl-9 rtl:pr-9 form-input ltr:group-[&.right]/form:pr-9 rtl:group-[&.right]/form:pl-9 ltr:group-[&.right]/form:pl-4 rtl:group-[&.right]/form:pr-4"
                    placeholder="Search student, class etc. ..."
                    value={searchQuery}
                    onChange={handleSearch}
                  />
                  <button className="absolute inset-y-0 flex items-center ltr:left-3 rtl:right-3 ltr:group-[&.right]/form:right-3 rtl:group-[&.right]/form:left-3 ltr:group-[&.right]/form:left-auto rtl:group-[&.right]/form:right-auto focus:outline-none">
                    <Search className="text-gray-500 size-4 fill-gray-100 dark:text-dark-500 dark:fill-dark-850" />
                  </button>
                </div>
              </div>
              <div>
                <div className="items-center gap-5 sm:flex">
                  <div id="sortingByClass" className="w-full">
                    <Select
                      classNamePrefix="select"
                      options={studentStd}
                      value={selectedStudentStd}
                      onChange={handleStudentStd}
                      placeholder="Sorting by class"
                      isClearable={true}
                    />
                  </div>
                  <Link
                    to="/apps/school/students-admission"
                    className="mt-5 btn btn-primary shrink-0 sm:mt-0"
                  >
                    <CirclePlus className="inline-block ltr:mr-1 rtl:ml-1 size-4" />{" "}
                    Add Student
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-0 card-body">
            <div>
              <TableContainer
                columns={columns || []}
                data={paginatedEvents}
                thClassName="!font-medium cursor-pointer"
                divClassName="overflow-x-auto table-box whitespace-nowrap"
                tableClassName="table flush"
                thTrClassName="text-gray-500 bg-gray-100 dark:bg-dark-850 dark:text-dark-500"
              />
              {filterStudent.length != 0 && (
                <Pagination
                  totalItems={filterStudent.length}
                  itemsPerPage={itemsPerPage}
                  currentPage={currentPage}
                  onPageChange={handlePageChange}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <Toaster
        position={"top-right"}
        reverseOrder={layoutDirection === LAYOUT_DIRECTION.RTL}
      />

      <DeleteModal
        show={show}
        handleHide={toggleDelete}
        deleteModalFunction={handleDeleteList}
      />
    </React.Fragment>
  );
};

export default StudentsList;
