import React, { useEffect } from "react";
import { NextPageWithLayout } from "@dtos/layout";
import BreadCrumb from "@src/components/common/breadCrumb";
import TableStripe from "@src/views/table/dataTables/datatablesStripe";

const Stripe: NextPageWithLayout = () => {
  useEffect(() => {
    document.title =
      "Stripe Datatables | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      <BreadCrumb title="Stripe" subTitle="Datatables" />
      <div className="grid grid-cols-12 gap-x-space">
        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">Stripe</h6>
          </div>
          <div className="card-body">
            <TableStripe />
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};
export default Stripe;
