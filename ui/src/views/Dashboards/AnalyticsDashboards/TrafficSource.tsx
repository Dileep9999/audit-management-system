import { Ellipsis } from "lucide-react";
import React, { useState } from "react";
import { TrafficSourceApp } from "./chart";
import { NextPageWithLayout } from "@dtos/layout";
import {
  Dropdown,
  DropdownButton,
  DropdownMenu,
} from "@src/components/custom/dropdown/dropdown";
import { Link } from "react-router-dom";

const TrafficSource: NextPageWithLayout = () => {
  const [timeFrame, setTimeFrame] = useState("Weekly");
  return (
    <React.Fragment>
      <div className="col-span-12 md:col-span-6 2xl:col-span-4 card">
        <div className="flex items-center gap-3 card-header">
          <h6 className="card-title grow">Traffic Source</h6>

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
                className="dropdown-item "
                onClick={() => setTimeFrame("Weekly")}
              >
                <span>Weekly</span>
              </Link>
              <Link
                to="#!"
                className="dropdown-item "
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
          <TrafficSourceApp
            chartColors="[bg-primary-500, bg-gray-200]"
            chartDarkColors={""}
            chartId="trafficSourceChart"
            timeFrame={timeFrame}
          />
        </div>
      </div>
    </React.Fragment>
  );
};
export default TrafficSource;
