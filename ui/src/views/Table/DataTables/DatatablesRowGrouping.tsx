import TableContainer from "@src/components/custom/table/Table";
import { employeData } from "@src/data/dataTables/employe-data";
import React, { useEffect, useMemo, useState } from "react";

interface GroupedRow {
  groupTitle?: string;
  Name?: string;
  Position?: string;
  Office?: string;
  Age?: number;
  StartDate?: string;
  Salary?: string;
}

const DataTablesRowGrouping: React.FC = () => {
  const [groupedData, setGroupedData] = useState<GroupedRow[]>([]);

  const columns = useMemo(
    () => [
      { accessorKey: "Name", header: "Name" },
      { accessorKey: "Position", header: "Position" },
      { accessorKey: "Age", header: "Age" },
      { accessorKey: "StartDate", header: "Start date" },
      { accessorKey: "Salary", header: "Salary" },
    ],
    [],
  );

  useEffect(() => {
    const groupBy = (array: any[], key: string) => {
      return array.reduce((result: any, currentValue) => {
        if (!result[currentValue[key]]) {
          result[currentValue[key]] = [];
        }
        result[currentValue[key]].push(currentValue);
        return result;
      }, {});
    };

    const grouped = groupBy(employeData, "Office");

    const groupedRows: GroupedRow[] = [];
    Object.keys(grouped).forEach((groupKey) => {
      groupedRows.push({
        Name: groupKey,
      });
      groupedRows.push(
        ...grouped[groupKey].map((item: any) => ({
          ...item,
        })),
      );
    });

    setGroupedData(groupedRows);
  }, []);

  return (
    <React.Fragment>
      <div className="table-container">
        <TableContainer
          columns={columns}
          data={groupedData}
          divClassName="overflow-x-auto"
          tableClassName="display table whitespace-nowrap dtr-inline"
          isPagination={true}
          PaginationClassName="pagination-container"
          thTrClassName="bg-gray-100 dark:bg-dark-850 dt-orderable-asc dt-orderable-desc dt-ordering-desc"
          trclassName={`${groupedData.map((item) =>
            Object.keys(item).length === 0
              ? "group bg-gray-50 border-y" // Group header class
              : "",
          )}`}
          isSearch={true}
          clasStyle="100%"
        />
      </div>
    </React.Fragment>
  );
};

export default DataTablesRowGrouping;
