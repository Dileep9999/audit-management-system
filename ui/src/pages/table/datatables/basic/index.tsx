import BreadCrumb from "@src/components/common/breadCrumb";
import { NextPageWithLayout } from "@dtos/layout";
import BasicTable from "@views/table/dataTables/basicTable";
import React, { useEffect } from "react";

const BasicTables: NextPageWithLayout = () => {
  useEffect(() => {
    document.title =
      "Basic DataTables | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      <BreadCrumb title="Basic" subTitle="DataTables" />
      <div className="grid grid-cols-12 gap-x-space">
        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">Basic</h6>
          </div>
          <div className="card-body">
            <BasicTable />
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};
export default BasicTables;
