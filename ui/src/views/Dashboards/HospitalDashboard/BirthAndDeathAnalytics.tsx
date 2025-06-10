import React, { useState } from "react";
import { Ellipsis } from "lucide-react";
import {
  Dropdown,
  DropdownButton,
  DropdownMenu,
} from "@src/components/custom/dropdown/dropdown";
import { Link } from "react-router-dom";
import { HospitalBirthDeathApp } from "./hostipalChart";

const BirthAndDeathAnalytics = () => {
  const [timeFrame, setTimeFrame] = useState("all");
  return (
    <React.Fragment>
      <div className="col-span-12 xl:col-span-4 card">
        <div className="flex items-center gap-3 card-header">
          <h6 className="card-title grow">Hospital Birth & Death Analytics</h6>
          <Dropdown
            position="right"
            trigger="click"
            dropdownClassName="dropdown"
          >
            <DropdownButton colorClass="flex items-center text-gray-500 dark:text-dark-500">
              {" "}
              <Ellipsis className="size-5" />
            </DropdownButton>
            <DropdownMenu>
              <Link
                to="#!"
                className="dropdown-item"
                onClick={() => setTimeFrame("Weekly")}
              >
                <span>Weekly</span>
              </Link>

              <Link
                to="#!"
                className="dropdown-item"
                onClick={() => setTimeFrame("Monthly")}
              >
                <span>Monthly</span>
              </Link>
              <Link
                to="#!"
                className="dropdown-item"
                onClick={() => setTimeFrame("Yearly")}
              >
                <span>Yearly</span>
              </Link>
            </DropdownMenu>
          </Dropdown>
        </div>
        <div className="card-body">
          <HospitalBirthDeathApp
            chartColors="[bg-primary-500, bg-red-500, bg-green-500]"
            chartDarkColors={""}
            chartId="hospitalBirthDeathChart"
            timeFrame={timeFrame}
          />
        </div>
      </div>
    </React.Fragment>
  );
};
export default BirthAndDeathAnalytics;
