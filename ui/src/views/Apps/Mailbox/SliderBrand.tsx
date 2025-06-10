import React, { useState } from "react";
import img6 from "@assets/images/brands/img-06.png";
import img8 from "@assets/images/brands/img-08.png";
import img9 from "@assets/images/brands/img-09.png";
import img16 from "@assets/images/brands/img-16.png";
import img17 from "@assets/images/brands/img-17.png";
import img20 from "@assets/images/brands/img-20.png";
import SimpleBar from "simplebar-react";
import {
  Dropdown,
  DropdownButton,
  DropdownMenu,
} from "@src/components/custom/dropdown/dropdown";
import { Ellipsis, RotateCcw, Search } from "lucide-react";
import { Modal } from "@src/components/custom/modal/modal";
import { Link } from "react-router-dom";
import Emails from "./emails";

interface Sidemail {
  show: boolean;
  handleShowMail: any;
  filteredEmails: any;
  isSideMail?: boolean;
}
const SliderBrand = ({
  show,
  handleShowMail,
  filteredEmails,
  isSideMail,
}: Sidemail) => {
  // refresh
  // const router = useRouter();

  const handleClick = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    // router.reload();
  };

  // -------------- search modal ----------------
  const [open, setOpen] = useState(false);

  const handleOpenModal = () => {
    setOpen(true);
  };

  const handleCloseModal = () => {
    setOpen(false);
  };

  const [searchTerms, setSearchTerms] = useState("");
  const [visibleItems, setVisibleItems] = useState([
    { _id: 1, text: "Chat Management", isVisible: true },
    { _id: 2, text: "Projects Discuss", isVisible: true },
    { _id: 3, text: "Subscriber", isVisible: true },
    { _id: 4, text: "Reports", isVisible: true },
  ]);

  const handleSearchChange = (e: {
    target: { value: React.SetStateAction<string> };
  }) => {
    setSearchTerms(e.target.value);
  };

  const handleItemClose = (_id: number) => {
    setVisibleItems((prevItems) =>
      prevItems.map((item) =>
        item._id === _id ? { ...item, isVisible: false } : item,
      ),
    );
  };

  return (
    <React.Fragment>
      {/* <div className={`${isSideMail ? "backdrop-overlay backdrop-blur-xs xl:hidden" : ""} `}></div> */}
      <div
        className={`${isSideMail ? "backdrop-overlay backdrop-blur-xs xl:hidden" : ""}`}
        onClick={() => handleShowMail(false)} // or setIsSideMail(false)
      ></div>
      <div
        className={`xl:rounded-none xl:border-x-0 card grow ${show === true ? "w-full xl:max-w-md" : "w-full"}`}
      >
        <div className="card-body">
          <SimpleBar>
            <div className="flex gap-4 *:shrink-0">
              <Link
                to="#!"
                className="block w-24 p-2 text-center transition duration-300 ease-linear rounded-md hover:bg-gray-50 dark:hover:bg-dark-850"
              >
                <div className="relative flex items-center justify-center mx-auto mb-1 text-lg font-semibold text-gray-500 bg-white border border-gray-200 rounded-full dark:bg-dark-900 dark:text-dark-500 dark:border-dark-800 size-12">
                  S
                  <span className="absolute flex items-center justify-center p-0 leading-none rounded-full text-11 -bottom-0.5 -right-0.5 border-2 border-white size-5 badge dark:border-dark-900 badge-solid-primary">
                    5
                  </span>
                </div>
                <h6 className="font-medium truncate">Shopia Mia</h6>
              </Link>
              <Link
                to="#!"
                className="block w-24 p-2 text-center transition duration-300 ease-linear rounded-md hover:bg-gray-50 dark:hover:bg-dark-850"
              >
                <div className="relative flex items-center justify-center mx-auto mb-1 text-lg font-semibold text-gray-500 bg-white border border-gray-200 rounded-full dark:bg-dark-900 dark:text-dark-500 dark:border-dark-800 size-12">
                  <img
                    src={img6}
                    alt="BrandImg"
                    className="size-6"
                    width={24}
                    height={24}
                  />
                </div>
                <h6 className="font-medium truncate">Windows Social Media</h6>
              </Link>
              <Link
                to="#!"
                className="block w-24 p-2 text-center transition duration-300 ease-linear rounded-md hover:bg-gray-50 dark:hover:bg-dark-850"
              >
                <div className="relative flex items-center justify-center mx-auto mb-1 text-lg font-semibold text-gray-500 bg-white border border-gray-200 rounded-full dark:bg-dark-900 dark:text-dark-500 dark:border-dark-800 size-12">
                  <img
                    src={img8}
                    alt="BrandImg"
                    className="size-6"
                    width={24}
                    height={24}
                  />
                  <span className="absolute flex items-center justify-center p-0 leading-none rounded-full text-11 -bottom-0.5 -right-0.5 border-2 border-white size-5 badge dark:border-dark-900 badge-solid-primary">
                    2
                  </span>
                </div>
                <h6 className="font-medium truncate">Shopify</h6>
              </Link>
              <Link
                to="#!"
                className="block w-24 p-2 text-center transition duration-300 ease-linear rounded-md hover:bg-gray-50 dark:hover:bg-dark-850"
              >
                <div className="relative flex items-center justify-center mx-auto mb-1 text-lg font-semibold text-gray-500 bg-white border border-gray-200 rounded-full dark:bg-dark-900 dark:text-dark-500 dark:border-dark-800 size-12">
                  <img
                    src={img20}
                    alt="BrandImg"
                    className="size-6"
                    width={24}
                    height={24}
                  />
                </div>
                <h6 className="font-medium truncate">Payment</h6>
              </Link>
              <Link
                to="#!"
                className="block w-24 p-2 text-center transition duration-300 ease-linear rounded-md hover:bg-gray-50 dark:hover:bg-dark-850"
              >
                <div className="relative flex items-center justify-center mx-auto mb-1 text-lg font-semibold text-gray-500 bg-white border border-gray-200 rounded-full dark:bg-dark-900 dark:text-dark-500 dark:border-dark-800 size-12">
                  <img
                    src={img9}
                    alt="BrandImg"
                    className="size-6"
                    width={24}
                    height={24}
                  />
                </div>
                <h6 className="font-medium truncate">Social Media</h6>
              </Link>
              <Link
                to="#!"
                className="block w-24 p-2 text-center transition duration-300 ease-linear rounded-md hover:bg-gray-50 dark:hover:bg-dark-850"
              >
                <div className="relative flex items-center justify-center mx-auto mb-1 text-lg font-semibold text-gray-500 bg-white border border-gray-200 rounded-full dark:bg-dark-900 dark:text-dark-500 dark:border-dark-800 size-12">
                  <img
                    src={img17}
                    alt="BrandImg"
                    className="size-6"
                    width={24}
                    height={24}
                  />
                </div>
                <h6 className="font-medium truncate">Romero</h6>
              </Link>
              <Link
                to="#!"
                className="block w-24 p-2 text-center transition duration-300 ease-linear rounded-md hover:bg-gray-50 dark:hover:bg-dark-850"
              >
                <div className="relative flex items-center justify-center mx-auto mb-1 text-lg font-semibold text-gray-500 bg-white border border-gray-200 rounded-full dark:bg-dark-900 dark:text-dark-500 dark:border-dark-800 size-12">
                  <img
                    src={img16}
                    alt="BrandImg"
                    className="size-6"
                    width={24}
                    height={24}
                  />
                </div>
                <h6 className="font-medium truncate">Romero</h6>
              </Link>
            </div>
          </SimpleBar>

          <div className="mt-3">
            <div className="flex items-center gap-2 mb-4">
              <div className="input-check-group shrink-0">
                {/* <!-- main checkbox --> */}
                {/* <input
                                        id="checkboxBasic1"
                                        className="input-check input-check-primary"
                                        type="checkbox"
                                    /> */}
              </div>
              <h6 className="grow">
                Main Inbox{" "}
                <small className="font-normal text-gray-500 ltr:ml-1 rtl:mt-1 dark:text-dark-500 text-14">
                  {" "}
                  46 messages
                </small>
              </h6>
              <div className="flex items-center gap-4 shrink-0">
                {/* <Link to="#!" className="link link-red"><Trash className="size-4"></Trash></Link> */}
                <Dropdown
                  position=""
                  trigger="click"
                  dropdownClassName="dropdown"
                >
                  <DropdownButton colorClass="flex items-center text-gray-500 dark:text-dark-500">
                    <Ellipsis className="size-5"></Ellipsis>
                  </DropdownButton>
                  <DropdownMenu>
                    <Link to="#!" className="dropdown-item">
                      <span>Show more messages</span>
                    </Link>
                    <Link to="#!" className="dropdown-item">
                      <span>Hide section when empty</span>
                    </Link>
                    <Link to="#!" className="dropdown-item">
                      <span>Manage Inbox settings</span>
                    </Link>
                    <Link to="#!" className="dropdown-item">
                      <span>Mark all as read</span>
                    </Link>
                  </DropdownMenu>
                </Dropdown>
                <Link
                  to="#!"
                  className="link link-primary"
                  onClick={handleClick}
                >
                  <RotateCcw className="size-4"></RotateCcw>
                </Link>
                <Link
                  to="#!"
                  className="link link-primary"
                  onClick={() => handleOpenModal()}
                >
                  <Search className="size-4"></Search>
                </Link>
              </div>
            </div>

            {/* mails */}
            <Emails
              filteredEmails={filteredEmails}
              handleShowMail={handleShowMail}
            />
          </div>
        </div>
      </div>

      {/* <!-- search modals --> */}
      <Modal
        isOpen={open}
        onClose={() => handleCloseModal()}
        position="modal-top"
        id="searchMailModals"
        contentClass="!overflow-y-visible modal-content"
        content={
          <div className="relative group/form grow">
            <input
              type="email"
              className="ltr:pl-9 rtl:pr-9 form-input ltr:group-[&.right]/form:pr-9 rtl:group-[&.right]/form:pl-9 ltr:group-[&.right]/form:pl-4 rtl:group-[&.right]/form:pr-4"
              placeholder="Search anythings ..."
              value={searchTerms}
              onChange={handleSearchChange}
            />
            <button className="absolute inset-y-0 flex items-center ltr:left-3 rtl:right-3 ltr:group-[&.right]/form:right-3 rtl:group-[&.right]/form:left-3 ltr:group-[&.right]/form:left-auto rtl:group-[&.right]/form:right-auto focus:outline-none">
              <Search className="text-gray-500 dark:text-dark-500 size-4 fill-gray-100 dark:fill-dark-850"></Search>
            </button>
            {searchTerms && (
              <div className="absolute inset-x-0 bg-white border border-gray-200 rounded-md top-full dark:bg-dark-900 dark:border-dark-800">
                <div className="p-5 max-h-72 ">
                  <p className="mb-2 text-sm text-gray-500 dark:text-dark-500">
                    Last Search
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {visibleItems.map(
                      (item) =>
                        item.isVisible && (
                          <span key={item._id} className="badge badge-gray">
                            {item.text}
                            <Link
                              to="#"
                              onClick={() => handleItemClose(item._id)}
                            >
                              <i className="ml-1 align-middle ri-close-fill"></i>
                            </Link>
                          </span>
                        ),
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        }
      />
    </React.Fragment>
  );
};

export default SliderBrand;
