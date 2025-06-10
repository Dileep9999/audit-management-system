import Pagination from "@src/components/common/pagination";
import {
  Dropdown,
  DropdownButton,
  DropdownMenu,
} from "@src/components/custom/dropdown/dropdown";
import TableContainer from "@src/components/custom/table/Table";
import productStockList from "@src/data/ecommerceDashboard/product-stock-list";
import { NextPageWithLayout } from "@dtos/layout";
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";

const ProductStock: NextPageWithLayout = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  const [open, setOpen] = useState(false);

  const toggle = () => {
    setOpen(!open);
  };
  const columns = useMemo(
    () => [
      {
        header: "Product Code",
        accessorKey: "id",
      },
      {
        header: "Item",
        accessorKey: "productName",
      },
      {
        header: "Qty Left",
        accessorKey: "stock",
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: ({ row }: any) => (
          <span
            className={`badge ${row.original.status === "In Stock" ? "badge-purple" : row.original.status === "Out of Stock" ? "badge-red" : "badge-yellow"}`}
          >
            {row.original.status}
          </span>
        ),
      },
      {
        header: "Price",
        accessorKey: "price",
      },
    ],
    [],
  );

  // const [currentPage, setCurrentPage] = useState(1);
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEvents = productStockList.slice(
    startIndex,
    startIndex + itemsPerPage,
  );
  return (
    <div className="order-8 col-span-12 2xl:col-span-8 2xl:row-span-2 card">
      <div className="flex items-center gap-3 card-header">
        <h6 className="card-title grow">Product Stock</h6>
        <Dropdown
          position=""
          trigger="click"
          dropdownClassName="shrink-0 dropdown"
        >
          <DropdownButton colorClass="flex px-3 py-1.5 text-xs border-gray-200 font-medium dark:border-dark-800 link link-primary btn">
            Recent
            <svg
              onClick={toggle}
              className={`transition-transform duration-300 ltr:ml-1 rtl:mr-1 size-4 ${open ? "transform rotate-180" : ""}`}
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
          <DropdownMenu>
            <Link to="#!" className="dropdown-item ">
              <span>Weekly</span>
            </Link>

            <Link to="#!" className="dropdown-item ">
              <span>Monthly</span>
            </Link>
            <Link to="#!" className="dropdown-item">
              <span>Yearly</span>
            </Link>
          </DropdownMenu>
        </Dropdown>
      </div>
      <div className="pt-0 card-body">
        <TableContainer
          isSearch={false}
          isPagination={false}
          columns={columns}
          data={paginatedEvents}
          thClassName="cursor-pointer !font-medium text-gray-500 bg-gray-100 dark:bg-dark-850 dark:text-dark-500"
          divClassName="overflow-x-auto table-box"
          tableClassName="table whitespace-nowrap"
          tBodyClassName="pt-0"
          thTrClassName="*:px-3 *:py-2.5"
          isTFooter={false}
        />
        {productStockList.length > 0 && (
          <Pagination
            totalItems={productStockList.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
};

export default ProductStock;
