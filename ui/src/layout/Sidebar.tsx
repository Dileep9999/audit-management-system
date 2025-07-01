import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import mainLogo from "@assets/images/main-logo.png";
import logoWhite from "@assets/images/logo-white.png";
import logoSm from "@assets/images/logo-sm-white.png";
import logoSmDark from "@assets/images/logo-sm-dark.png";
import user17 from "@assets/images/avatar/user-17.png";
import {
  BellDot,
  ChevronDown,
  Gem,
  Headset,
  Presentation,
  Settings,
  Gauge,
  Box,
  MessagesSquare,
  Calendar,
  Mail,
  ShoppingBag,
  Folders,
  Monitor,
  Shapes,
  Trophy,
  Hospital,
  School,
  FileText,
  UsersRound,
  AlignStartVertical,
  KeyRound,
  PencilRuler,
  BookOpen,
  RemoveFormatting,
  Clipboard,
  TextQuote,
  Table2,
  ChartBarBig,
  TrendingDown,
  Dna,
  ChartScatter,
  Map,
  LifeBuoy,
  Feather,
  LogOut,
  Building2,
} from "lucide-react";
import SimpleBar from "simplebar-react";
import {
  Dropdown,
  DropdownButton,
  DropdownMenu,
  DropdownPosition,
} from "@src/components/custom/dropdown/dropdown";
import { useSelector } from "react-redux";
import { RootState } from "@src/slices/reducer";
import { LAYOUT_TYPES, SIDEBAR_SIZE } from "@src/components/constants/layout";

interface SidebarProps {
  searchSidebar: any;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar = ({
  searchSidebar,
  isSidebarOpen,
  toggleSidebar,
}: SidebarProps) => {
  const { t } = useTranslation();
  const [sidebarDropdownPosition, setSidebarDropdownPosition] =
    useState<DropdownPosition>("top-right");
  const router = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const { layoutType, layoutSidebar } = useSelector(
    (state: RootState) => state.Layout,
  );

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (layoutType === "horizontal") {
      setSidebarDropdownPosition("");
    } else {
      setSidebarDropdownPosition("top-right");
    }
  }, [layoutType]);

  const getLucideIcon = (icon: string, className: string) => {
    const icons: { [key: string]: React.ReactElement } = {
      gauge: <Gauge className={className} />,
      box: <Box className={className} />,
      "messages-square": <MessagesSquare className={className} />,
      calendar: <Calendar className={className} />,
      mail: <Mail className={className} />,
      "shopping-bag": <ShoppingBag className={className} />,
      folders: <Folders className={className} />,
      monitor: <Monitor className={className} />,
      shapes: <Shapes className={className} />,
      trophy: <Trophy className={className} />,
      hospital: <Hospital className={className} />,
      school: <School className={className} />,
      "file-text": <FileText className={className} />,
      "users-round": <UsersRound className={className} />,
      "align-start-vertical": <AlignStartVertical className={className} />,
      "key-round": <KeyRound className={className} />,
      gem: <Gem className={className} />,
      "pencil-ruler": <PencilRuler className={className} />,
      "book-open": <BookOpen className={className} />,
      "remove-formatting": <RemoveFormatting className={className} />,
      clipboard: <Clipboard className={className} />,
      "text-quote": <TextQuote className={className} />,
      "table-2": <Table2 className={className} />,
      "bar-chart-3": <ChartBarBig className={className} />,
      "trending-up-down": <TrendingDown className={className} />,
      dna: <Dna className={className} />,
      "scatter-chart": <ChartScatter className={className} />,
      map: <Map className={className} />,
      "life-buoy": <LifeBuoy className={className} />,
      "file-textt": <FileText className={className} />,
      feather: <Feather className={className} />,
      building: <Building2 className={className} />,
    };
    return icons[icon.toLowerCase()];
  };

  const isActive = (menuItem: any) => {
    if (location.pathname === menuItem.link) return true; // Check if the current path matches the item's link

    return menuItem.children.some(
      (child: any) =>
        child.link === location.pathname || // Check if the current path matches the child's link
        (child.children.length > 0 && isActive(child)), // Recursively check nested children
    );
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  const handleOnLogout = () => {
    localStorage.setItem("wasLoggedIn", "false");
    navigate("/login");
  };
  return (
    <>
      {isSidebarOpen === true && (
        <>
          <div
            id="main-sidebar"
            className={`main-sidebar group-data-[layout=boxed]:top-[calc(theme('spacing.topbar')_+_theme('spacing.sidebar-boxed'))] lg:block ${
              scrolled ? "group-data-[layout=boxed]:!top-topbar" : "scrolled"
            }`}
          >
            <div className="sidebar-wrapper">
              <div>
                <div className="navbar-brand">
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center justify-center w-full"
                  >
                    <div className="group-data-[sidebar=small]:hidden">
                      <span className="text-2xl font-bold text-primary-500 dark:text-white">AMS</span>
                    </div>
                    <div className="hidden group-data-[sidebar=small]:inline-block">
                      <span className="text-2xl font-bold text-primary-500 dark:text-white">A</span>
                    </div>
                  </Link>
                </div>

                <div className="relative group-data-[layout=horizontal]:hidden group-data-[sidebar=small]:w-full">
                  <div className="block dropdown">
                    <Dropdown
                      position=""
                      trigger="click"
                      dropdownClassName="dropdown w-full"
                      toggleSidebar={toggleSidebar}
                    >
                      <DropdownButton colorClass="flex items-center w-full gap-2 p-4 text-left group-data-[sidebar=small]:px-0">
                        <img
                          src={user17}
                          alt="user"
                          className="h-10 rounded-md shrink-0 group-data-[sidebar=small]:mx-auto"
                          width={40}
                          height={40}
                        />
                        <div className="grow group-data-[sidebar=icon]:hidden group-data-[sidebar=small]:hidden overflow-hidden text-new-500">
                          <h6 className="font-medium truncate text-sidebar-text-active">
                            Sophia Mia
                          </h6>
                          <p className="text-menu-title text-14">ID: 150001</p>
                        </div>
                        <div className="shrink-0 text-sidebar-text group-data-[sidebar=icon]:hidden group-data-[sidebar=small]:hidden group-data-[sidebar=medium]:hidden">
                          <ChevronDown className="size-4" />
                        </div>
                      </DropdownButton>
                      <DropdownMenu menuclass="z-50 p-5 bg-white rounded-md shadow-lg !w-64 !left-3">
                        <div className="flex items-center gap-2">
                          <img
                            src={user17}
                            alt="user"
                            className="rounded-full size-10"
                          />
                          <div>
                            <h6>Hello</h6>
                            <p>
                              <Link to="#!" className="link link-primary">
                                {" "}
                                hello@example.com{" "}
                              </Link>
                            </p>
                          </div>
                        </div>
                        <div className="pt-2 mt-3 border-t border-gray-200 dark:border-dark-800">
                          <div>
                            <button
                              className="inline-block py-2 text-gray-500 ltr:text-left rtl:text-right hover:text-primary-500"
                              onClick={handleOnLogout}
                            >
                              <LogOut className="inline-block mr-2 size-4" />{" "}
                              Log Out
                            </button>
                          </div>
                        </div>
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                </div>
              </div>

              <div className="fixed top-0 bottom-0 left-0 w-20 bg-white bg-light hidden group-data-[layout=doulcolumn]:block"></div>
              <SimpleBar className="navbar-menu" id="navbar-menu-list">
                <ul
                  className="group-data-[layout=horizontal]:md:flex group-data-[layout=horizontal]:*:shrink-0"
                  id="sidebar"
                >
                  {searchSidebar && searchSidebar.length > 0
                    ? searchSidebar.map((item: any, index: number) => (
                        <li
                          key={index}
                          className={item.separator ? "menu-title" : "relative"}
                        >
                          {/* Check for separator */}
                          {!item.children.length && item.separator && (
                            <span className="group-data-[sidebar=small]:hidden">
                              {t(item.lang)}
                            </span>
                          )}

                          {/* If it has children */}
                          {!item.separator && item.children.length > 0 && (
                            <Dropdown
                              position={sidebarDropdownPosition}
                              trigger="click"
                              isActive={
                                layoutSidebar !== SIDEBAR_SIZE.SMALL
                                  ? isActive(item)
                                  : false
                              }
                              closeOnOutsideClick={
                                layoutType === LAYOUT_TYPES.HORIZONTAL ||
                                layoutSidebar === SIDEBAR_SIZE.SMALL
                              }
                              closeOnOutsideClickSidebar={
                                layoutType !== LAYOUT_TYPES.HORIZONTAL
                              }
                              toggleSidebar={toggleSidebar}
                            >
                              <DropdownButton
                                colorClass={`nav-link ${isActive(item) ? "active" : ""}`}
                                arrow={true}
                              >
                                <span className="w-6 group-data-[sidebar=small]:mx-auto shrink-0">
                                  {item.icon &&
                                    getLucideIcon(
                                      item.icon,
                                      "size-4 group-data-[sidebar=small]:size-5 group-data-[sidebar=medium]:size-5",
                                    )}
                                </span>
                                <span className="group-data-[sidebar=small]:hidden">
                                  {t(item.lang)}
                                </span>
                              </DropdownButton>

                              <DropdownMenu
                                handleMenuClick={handleMenuClick}
                                sidebar={true}
                              >
                                <ul className="dropdown-wrapper">
                                  {item.children.map(
                                    (child: any, childIndex: number) => (
                                      <li key={childIndex}>
                                        {/* Check for nested children */}
                                        {child.children.length > 0 ? (
                                          <Dropdown
                                            position="top-right"
                                            trigger="click"
                                            isActive={isActive(child)}
                                            closeOnOutsideClick={
                                              layoutType ===
                                                LAYOUT_TYPES.HORIZONTAL ||
                                              layoutSidebar ===
                                                SIDEBAR_SIZE.SMALL
                                            }
                                            closeOnOutsideClickSidebar={
                                              layoutType !==
                                              LAYOUT_TYPES.HORIZONTAL
                                            }
                                          >
                                            <DropdownButton
                                              colorClass={`nav-link ${isActive(child) ? "active" : ""}`}
                                              arrow={true}
                                            >
                                              <span>{t(child.lang)}</span>
                                            </DropdownButton>

                                            <DropdownMenu
                                              handleMenuClick={handleMenuClick}
                                              sidebar={true}
                                            >
                                              <ul className="dropdown-wrapper">
                                                {child.children.map(
                                                  (
                                                    subChild: any,
                                                    subIndex: number,
                                                  ) => (
                                                    <li key={subIndex}>
                                                      <Link
                                                        to={subChild.link}
                                                        className={`${location.pathname === subChild.link ? "active" : ""}`}
                                                      >
                                                        {t(subChild.lang)}
                                                      </Link>
                                                    </li>
                                                  ),
                                                )}
                                              </ul>
                                            </DropdownMenu>
                                          </Dropdown>
                                        ) : (
                                          <Link
                                            to={child.link}
                                            className={` content ${location.pathname === child.link ? "active" : ""}`}
                                          >
                                            {t(child.lang)}
                                          </Link>
                                        )}
                                      </li>
                                    ),
                                  )}
                                </ul>
                              </DropdownMenu>
                            </Dropdown>
                          )}

                          {/* Simple link without children */}
                          {!item.separator &&
                            !item.children.length &&
                            item.link && (
                              <Link
                                to={item.link}
                                className={`nav-link flex items-center gap-2 ${location.pathname === item.link ? "active" : ""}`}
                              >
                                <span>
                                  {item.icon &&
                                    getLucideIcon(
                                      item.icon,
                                      "size-4 group-data-[sidebar=small]:size-5 group-data-[sidebar=medium]:size-5",
                                    )}
                                </span>
                                <span className="group-data-[sidebar=small]:hidden">
                                  {t(item.lang)}
                                </span>
                              </Link>
                            )}
                        </li>
                      ))
                    : ""}
                </ul>
              </SimpleBar>
            </div>
          </div>
          <div
            id="backdrop"
            className={`backdrop-overlay backdrop-blur-xs z-[1004] lg:hidden print:hidden`}
            onClick={toggleSidebar}
          ></div>
        </>
      )}
    </>
  );
};

export default Sidebar;
