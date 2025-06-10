import { NextPageWithLayout } from "@dtos/layout";
import {
  Dropdown,
  DropdownButton,
  DropdownMenu,
} from "@src/components/custom/dropdown/dropdown";
import { Ellipsis } from "lucide-react";
import React from "react";

const CustomerAndRate: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <div className="col-span-12 md:col-span-6 xl:col-span-2 card">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <p className="text-gray-500 dark:text-dark-500">Total Customers</p>
            <Dropdown
              position="right"
              trigger="click"
              dropdownClassName="dropdown"
            >
              <DropdownButton colorClass="flex items-center text-gray-500 dark:text-dark-500">
                <Ellipsis className="size-5" />
              </DropdownButton>
              <DropdownMenu>
                <a href="#!" className="dropdown-item">
                  <span>Weekly</span>
                </a>
                <a href="#!" className="dropdown-item">
                  <span>Monthly</span>
                </a>
                <a href="#!" className="dropdown-item">
                  <span>Yearly</span>
                </a>
              </DropdownMenu>
            </Dropdown>
          </div>
          <h5 className="mt-6 mb-1">1,32,603</h5>
          <p className="text-gray-500 dark:text-dark-500">
            <span className="text-green-500">0.5%</span> From last week
          </p>
        </div>
      </div>
      <div className="col-span-12 md:col-span-6 xl:col-span-2 card">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <p className="text-gray-500 dark:text-dark-500">Bounce Rate</p>
            <Dropdown
              position="right"
              trigger="click"
              dropdownClassName="dropdown"
            >
              <DropdownButton colorClass="flex items-center text-gray-500 dark:text-dark-500">
                <Ellipsis className="size-5" />
              </DropdownButton>
              <DropdownMenu>
                <a href="#!" className="dropdown-item">
                  <span>Weekly</span>
                </a>
                <a href="#!" className="dropdown-item">
                  <span>Monthly</span>
                </a>
                <a href="#!" className="dropdown-item">
                  <span>Yearly</span>
                </a>
              </DropdownMenu>
            </Dropdown>
          </div>
          <h5 className="mt-6 mb-1">48,314</h5>
          <p className="text-gray-500 dark:text-dark-500">
            <span className="text-green-500">1.8%</span> From last week
          </p>
        </div>
      </div>
    </React.Fragment>
  );
};
export default CustomerAndRate;
