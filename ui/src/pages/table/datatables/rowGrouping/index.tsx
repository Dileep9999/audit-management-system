import BreadCrumb from "@src/components/common/breadCrumb";
import { NextPageWithLayout } from "@dtos/layout";
import React, { useEffect } from "react";
import DataTablesRowGrouping from "@src/views/table/dataTables/datatablesRowGrouping";

const RowGrouPing: NextPageWithLayout = () => {
  useEffect(() => {
    document.title =
      "Row Grouping Datatables | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      <BreadCrumb title="Row Grouping" subTitle="Datatables" />
      <div className="grid grid-cols-12 gap-x-space">
        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">Row Grouping</h6>
          </div>
          <div className="card-body">
            <DataTablesRowGrouping />
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};
export default RowGrouPing;
