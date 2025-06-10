import React, { useState } from "react";
import { Ellipsis } from "lucide-react";
import { FollowersApp } from "./chart";
import { NextPageWithLayout } from "@dtos/layout";
import {
  Dropdown,
  DropdownButton,
  DropdownMenu,
} from "@src/components/custom/dropdown/dropdown";
import { Link } from "react-router-dom";

const Followers: NextPageWithLayout = () => {
  const [timeFrame, setTimeFrame] = useState("weekly");
  return (
    <React.Fragment>
      <div className="col-span-12 2xl:col-span-4 card">
        <div className="flex items-center gap-3 card-header">
          <h6 className="card-title grow">Followers</h6>
          <Dropdown trigger="click" dropdownClassName="dropdown">
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
          <FollowersApp
            chartColors="[bg-primary-500, bg-primary-200]"
            chartDarkColors={""}
            chartId="followersChart"
            timeFrame={timeFrame}
          />
        </div>
      </div>
    </React.Fragment>
  );
};
export default Followers;
