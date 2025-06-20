import {
  Dropdown,
  DropdownButton,
  DropdownMenu,
} from "@src/components/custom/dropdown/dropdown";
import { InvoiceList } from "@src/dtos";
import React, { useState } from "react";
import StutasChart from "./stutasChart";
import { Link } from "react-router-dom";

interface InvoiceStatusProps {
  invoices: InvoiceList[];
}

const InvoiceStatus: React.FC<InvoiceStatusProps> = () => {
  const [timeFrame, setTimeFrame] = useState("Last Week");

  return (
    <React.Fragment>
      <div className="col-span-12 md:col-span-6 xl:col-span-4 2xl:col-span-4 card">
        <div className="flex items-center gap-3 card-header">
          <h6 className="card-title grow">Invoice Status</h6>
          <Dropdown
            position="right"
            trigger="click"
            dropdownClassName="dropdown"
          >
            <DropdownButton colorClass="flex px-2 py-1 text-xs border-gray-200 dark:border-dark-800 link link-red btn">
              Last Week
              <svg
                className="transition-transform duration-300 size-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </DropdownButton>
            <DropdownMenu menuclass="p-2">
              <Link
                to="#!"
                className="dropdown-item "
                onClick={() => setTimeFrame("Last Week")}
              >
                Last Week
              </Link>

              <Link
                to="#!"
                className="dropdown-item "
                onClick={() => setTimeFrame("Last Month")}
              >
                Last Month
              </Link>
              <Link
                to="#!"
                className="dropdown-item"
                onClick={() => setTimeFrame("Last Years")}
              >
                Last Years
              </Link>
            </DropdownMenu>
          </Dropdown>
        </div>
        <div className="card-body">
          <div dir="ltr">
            <StutasChart
              chartColors="[bg-green-500, bg-sky-500, bg-yellow-500, bg-red-500, bg-purple-500]"
              chartDarkColors={""}
              chartId="simpleDonutChart"
              timeFrame={timeFrame}
            />
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default InvoiceStatus;
