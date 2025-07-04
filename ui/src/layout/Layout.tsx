import React, { useCallback, useEffect, useState } from "react";
import Footer from "./Footer";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@src/slices/reducer";
import { changeSidebarSize } from "@src/slices/thunk";
import TopBar from "./Topbar";
import { MegaMenu, SubMenu, MainMenu } from "@src/dtos";
import { LAYOUT_TYPES, SIDEBAR_SIZE } from "@src/components/constants/layout";
import Sidebar from "./Sidebar";
import { menu } from "@data/index";
import { changeHTMLAttribute, setNewThemeData } from "@src/slices/layout/utils";
import { changeSettingModalOpen } from "@src/slices/layout/reducer";
import { useLocation, useNavigate } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
  breadcrumbTitle?: string;
}

const Layout = ({ children, breadcrumbTitle }: LayoutProps) => {
  const title = breadcrumbTitle
    ? ` ${breadcrumbTitle} | Domiex - React TS Admin & Dashboard Template `
    : "Domiex - Admin & Dashboard Template";

  // Initialize sidebar states
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => 
    window.innerWidth >= 1000
  );
  const [isLargeScreen, setIsLargeScreen] = useState<boolean>(() => 
    window.innerWidth >= 1000
  );

  const {
    layoutMode,
    layoutType,
    layoutWidth,
    layoutSidebar,
    layoutDarkModeClass,
    layoutSidebarColor,
    layoutDataColor,
    layoutDirection,
    layoutLanguages,
  } = useSelector((state: RootState) => state.Layout);
  const dispatch = useDispatch<AppDispatch>();
  const [searchSidebar, setSearchSidebar] = useState<MegaMenu[]>(menu);
  const [searchValue, setSearchValue] = useState<string>("");
  const router = useLocation();
  const navigate = useNavigate();

  const handleThemeSidebarSize = useCallback(() => {
    if (layoutType !== "horizontal") {
      // Toggle between BIG and SMALL sidebar
      const newSize =
        layoutSidebar === SIDEBAR_SIZE.DEFAULT
          ? SIDEBAR_SIZE.SMALL
          : SIDEBAR_SIZE.DEFAULT;
      setNewThemeData("data-sidebar-size", newSize);
      changeHTMLAttribute("data-sidebar", newSize);
      dispatch(changeSidebarSize(newSize));
    } else {
      // If layout is horizontal, always use default size
      setNewThemeData("data-sidebar-size", SIDEBAR_SIZE.DEFAULT);
      changeHTMLAttribute("data-sidebar", SIDEBAR_SIZE.DEFAULT);
      dispatch(changeSidebarSize(SIDEBAR_SIZE.DEFAULT));
    }
  }, [layoutType, layoutSidebar, dispatch]);

  const toggleSidebar = useCallback(() => {
    if (!isLargeScreen) {
      // Mobile behavior: toggle sidebar visibility
      setIsSidebarOpen(prev => !prev);
    } else {
      // Desktop behavior: toggle sidebar size
      handleThemeSidebarSize();
    }
  }, [isLargeScreen, handleThemeSidebarSize]);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const isLarge = width >= 1000;
      
      setIsLargeScreen(isLarge);
      
      // Only auto-open sidebar on large screens
      if (isLarge) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
      
      // Handle layout type changes
      if (layoutType === LAYOUT_TYPES.SEMIBOX || layoutType === LAYOUT_TYPES.MODERN) {
        document.documentElement.setAttribute(
          "data-layout",
          isLarge ? layoutType : "default"
        );
      } else {
        document.documentElement.setAttribute("data-layout", layoutType);
      }
    };

    // Initial layout check on component mount
    handleResize();
    
    // Listen for window resize events
    window.addEventListener("resize", handleResize);
    
    // Cleanup the event listener on unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [layoutType]);

  // handle search menu
  const handleSearchClient = (value: string) => {
    setSearchValue(value);

    if (value.trim() !== "") {
      const filteredMenu: MegaMenu[] = menu.filter((megaItem: MegaMenu) => {
        // Filter the first level: MegaMenu
        const isMegaMenuMatch =
          megaItem.title.toLowerCase().includes(value.toLowerCase()) ||
          megaItem.lang.toLowerCase().includes(value.toLowerCase());

        // Filter the second level: MainMenu (children of MegaMenu)
        const filteredMainMenu = megaItem.children?.filter(
          (mainItem: MainMenu) => {
            const isMainMenuMatch =
              mainItem.title.toLowerCase().includes(value.toLowerCase()) ||
              mainItem.lang.toLowerCase().includes(value.toLowerCase());

            // Filter the third level: SubMenu (children of MainMenu)
            const filteredSubMenu = mainItem.children?.filter(
              (subItem: SubMenu) => {
                return (
                  subItem.title.toLowerCase().includes(value.toLowerCase()) ||
                  subItem.lang.toLowerCase().includes(value.toLowerCase())
                );
              },
            );

            // If SubMenu matches or MainMenu matches, return the filtered item
            return (
              isMainMenuMatch || (filteredSubMenu && filteredSubMenu.length > 0)
            );
          },
        );

        // Return MegaMenu item if it matches or has any matching MainMenu children
        return (
          isMegaMenuMatch || (filteredMainMenu && filteredMainMenu.length > 0)
        );
      });

      setSearchSidebar(filteredMenu);
    } else {
      setSearchSidebar(menu);
    }
  };
  useEffect(() => {
    setSearchSidebar(menu);
  }, []);
  useEffect(() => {
    document.documentElement.classList.add("scroll-smooth", "group");
    document.documentElement.setAttribute("data-mode", layoutMode);
    document.documentElement.setAttribute("data-colors", layoutDataColor);
    document.documentElement.setAttribute("lang", layoutLanguages === 'ar' ? 'ar' : 'en');
    document.documentElement.setAttribute("data-layout", layoutType);
    document.documentElement.setAttribute("data-content-width", layoutWidth);
    document.documentElement.setAttribute("data-sidebar", layoutSidebar);
    document.documentElement.setAttribute(
      "data-sidebar-colors",
      layoutSidebarColor,
    );
    document.documentElement.setAttribute("data-nav-type", layoutDarkModeClass);
    document.documentElement.setAttribute("dir", layoutDirection);
  }, [layoutMode, layoutDataColor, layoutType, layoutWidth, layoutSidebar, layoutSidebarColor, layoutDarkModeClass, layoutDirection, layoutLanguages]);

  return (
    <React.Fragment>
      {/* Main topbar */}
      {/* <Head> */}
      <title>{title}</title>
      {/* </Head> */}

      <TopBar
        searchMenu={(value: string) => handleSearchClient(value)}
        searchText={searchValue}
        toggleSidebar={toggleSidebar}
      />

      {/* sidebar */}

      <Sidebar
        searchSidebar={searchSidebar}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />

      <div className="relative min-h-screen group-data-[layout=boxed]:bg-white group-data-[layout=boxed]:rounded-md">
        <div className="page-wrapper pt-[calc(theme('spacing.topbar')_*_1.2)]">
          {" "}
          {children}
        </div>
        {/* <Footer /> */}
      </div>
    </React.Fragment>
  );
};

export default Layout;
