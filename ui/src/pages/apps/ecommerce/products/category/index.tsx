import BreadCrumb from "@src/components/common/breadCrumb";
import {
  Dropdown,
  DropdownButton,
  DropdownMenu,
} from "@src/components/custom/dropdown/dropdown";
import TableContainer from "@src/components/custom/table/Table";
import { NextPageWithLayout } from "@src/dtos";
import { AppDispatch, RootState } from "@src/slices/reducer";
import { getCategoryData } from "@src/slices/thunk";
import { Search, Trash } from "lucide-react";
import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

const Category: NextPageWithLayout = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { categoryList } = useSelector((state: RootState) => state.Category);

  useEffect(() => {
    dispatch(getCategoryData());
  }, [dispatch]);

  const [allCategoryProductList, setAllCategoryProductList] = React.useState<
    any[]
  >([]);

  useEffect(() => {
    setAllCategoryProductList(categoryList);
  }, [categoryList]);

  // status color
  const getStatusClass = (status: string | undefined) => {
    switch (status) {
      case "Active":
        return "badge badge-green";
      case "Inactive":
        return "badge badge-gray";
      default:
        return "badge";
    }
  };

  useEffect(() => {
    document.title =
      "Category List | Domiex - React TS Admin & Dashboard Template";
  }, []);

  // table header
  const columns = useMemo(
    () => [
      {
        header: "Category ID",
        accessorKey: "CategoryId",
      },
      {
        header: "Category Name",
        accessorKey: "category",
        cell: (value: any) => {
          return (
            <>
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center p-1 border border-gray-200 rounded-smsize-9 dark:border-dark-800">
                  <img
                    src={value.row.original.image}
                    alt="categoryImg"
                    className="rounded"
                    width={26}
                    height={26}
                  />
                </div>
                <h6>
                  <Link to="#!">{value.row.original.category}</Link>
                </h6>
              </div>
            </>
          );
        },
      },
      {
        header: "Products",
        accessorKey: "products",
      },
      {
        header: "status",
        accessorKey: "status",
        cell: ({ row }: any) => {
          const { status } = row.original;
          return <span className={getStatusClass(status)}>{status}</span>;
        },
      },
      {
        header: "Action",
        accessorKey: "",
        cell: () => (
          <>
            <Dropdown position="right" trigger="click">
              <DropdownButton colorClass="flex items-center text-gray-500 dark:text-dark-500">
                <i className="ri-more-2-fill"></i>
              </DropdownButton>
              <DropdownMenu>
                <Link to="#!" className="dropdown-item ">
                  <i className="align-middle ltr:mr-2 rtl:ml-2 ri-eye-line"></i>{" "}
                  <span>Overview</span>
                </Link>

                <Link
                  to="#!"
                  className="dropdown-item "
                  onClick={(e) => {
                    e.preventDefault();
                  }}
                >
                  <i className="align-middle ltr:mr-2 rtl:ml-2 ri-pencil-line"></i>{" "}
                  <span>Edit</span>
                </Link>
                <Link
                  to="#!"
                  className="dropdown-item"
                  onClick={(e) => {
                    e.preventDefault();
                  }}
                >
                  <i className="align-middle ltr:mr-2 rtl:ml-2 ri-delete-bin-line"></i>{" "}
                  <span>Delete</span>
                </Link>
              </DropdownMenu>
            </Dropdown>
          </>
        ),
      },
    ],
    [],
  );

  return (
    <React.Fragment>
      <BreadCrumb title="Category List" subTitle="E-commerce" />
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-7 xl:col-span-8">
          {/* card */}
          <div className="card">
            {/* card header */}
            <div className="card-header">
              <div className="grid items-center grid-cols-12 gap-3">
                <div className="col-span-3">
                  <h6 className="card-title">Category List</h6>
                </div>

                <div className="col-span-4 col-start-9">
                  <div className="flex gap-2">
                    <div className="relative group/form grow">
                      <input
                        type="text"
                        className="ltr:pl-9 rtl:pr-9 form-input ltr:group-[&.right]/form:pr-9 rtl:group-[&.right]/form:pl-9 ltr:group-[&.right]/form:pl-4 rtl:group-[&.right]/form:pr-4"
                        placeholder="Search for ..."
                      />
                      <button className="absolute inset-y-0 flex items-center text-gray-500 dark:text-dark-500 ltr:left-3 rtl:right-3 ltr:group-[&.right]/form:right-3 rtl:group-[&.right]/form:left-3 ltr:group-[&.right]/form:left-auto rtl:group-[&.right]/form:right-auto focus:outline-none">
                        <Search className="size-4" />
                      </button>
                    </div>
                    <button className="btn btn-red btn-icon shrink-0">
                      <Trash className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* card body */}
            <div className="pt-0 card-body">
              {/* main table  */}
              <TableContainer
                columns={columns}
                data={allCategoryProductList}
                thClassName="!font-medium input-check-group"
                isSearch={false}
                divClassName="overflow-x-auto table-box"
                tableClassName="table hovered"
                PaginationClassName="pagination-container"
                thTrClassName="text-gray-500 bg-gray-100 dark:bg-dark-850 dark:text-dark-500"
                isTFooter={false}
              />
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Category;
