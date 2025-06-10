import { useState, useEffect, useMemo } from "react";
import { MoveLeft, MoveRight } from "lucide-react";
import { NextPageWithLayout } from "@dtos/layout";
import { Student } from "@dtos/index";
import { resultList } from "@data/index";
import { Link } from "react-router-dom";
import TableContainer from "@src/components/custom/table/Table";
import Pagination from "@src/components/common/pagination";

const TopScoreTable: NextPageWithLayout = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const startID = 1478;
    const updatedData = resultList.map((student: Student, index: number) => ({
      ...student,
      emailsID: `PEE-${startID + index}`,
    }));
    setStudents(updatedData);
  }, []);

  const columns = useMemo(
    () => [
      {
        accessorKey: "studentsName",
      },
      {
        accessorKey: "marks",
        cell: ({ row }: any) => <>{`${row.original.marks}/600`}</>,
      },
      {
        accessorKey: "resultDate",
      },
      {
        accessorKey: "grade",
      },
      {
        accessorKey: "name",
        cell: ({ row }: any) => (
          <span
            className={`   ${row.original.passFail === "Pass" ? "badge badge-green" : "badge badge-orange"}`}
          >
            {row.original.passFail}
          </span>
        ),
      },
    ],
    [],
  );
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEvents = students.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="order-11 col-span-12 2xl:col-span-9 card">
      <div className="flex items-center gap-3 card-header">
        <h6 className="card-title grow">Top Score</h6>
        <div className="shrink-0">
          <Link
            to="/apps/school/students-list"
            className="py-1 px-2.5 btn btn-primary"
          >
            View All{" "}
            <MoveRight className="ml-1 ltr:inline-block rtl:hidden size-4" />
            <MoveLeft className="mr-1 rtl:inline-block ltr:hidden size-4" />
          </Link>
        </div>
      </div>
      <div className="pt-0 card-body">
        <TableContainer
          isSearch={false}
          isPagination={false}
          columns={columns}
          data={paginatedEvents}
          thClassName="hidden"
          divClassName="overflow-x-auto table-box"
          tableClassName="table flush"
          thTrClassName="pr-3 !pl-0 !py-2.5"
          isTFooter={false}
        />
        {students.length >= 0 && (
          <Pagination
            totalItems={students.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
};

export default TopScoreTable;
