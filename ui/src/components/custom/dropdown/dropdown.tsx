import React, {
  useState,
  createContext,
  useContext,
  useRef,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { LAYOUT_TYPES, SIDEBAR_SIZE } from "@constants/layout";
import { useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { RootState } from "@src/slices/reducer";
import { ChevronDown } from "lucide-react";
import useTranslation from "@src/hooks/useTranslation";

export type DropdownPosition = "" | "right" | "top-right" | "top-left";
interface DropdownProps {
  position?: DropdownPosition;
  trigger?: "click" | "hover";
  children: ReactNode;
  dropdownClassName?: string;
  closeOnOutsideClick?: boolean;
  closeOnOutsideClickSidebar?: boolean;
  isActive?: boolean | null;
  toggleSidebar?: () => void;
}

interface DropdownContextProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  position: string;
  trigger: string;
  close: () => void;
  calculatePosition: () => void;
  menuRef?: React.RefObject<HTMLDivElement> | null | undefined;
}
let openDropdowns: any = [];
const DropdownContext = createContext<DropdownContextProps | undefined>(
  undefined,
);
const Dropdown: React.FC<DropdownProps> = ({
  position = "bottom",
  trigger = "click",
  children,
  dropdownClassName,
  isActive,
  closeOnOutsideClick = true,
  closeOnOutsideClickSidebar = true,
  toggleSidebar,
}) => {
  const { layoutType, layoutSidebar } = useSelector(
    (state: RootState) => state.Layout,
  );
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement>(null!);
  const { pathname } = useLocation();
  const { isRTL } = useTranslation();

  const handleToggle = useCallback(() => {
    // if horizontall
    if (
      layoutType === LAYOUT_TYPES.HORIZONTAL ||
      layoutSidebar === SIDEBAR_SIZE.SMALL
    ) {
      if (!dropdownRef?.current?.closest(".dropdown-menu")) openDropdowns = [];

      openDropdowns.push(dropdownRef);
      let count = 0;
      if (openDropdowns.length > 2) {
        openDropdowns = openDropdowns.filter((item: any) => {
          count++;
          if (count === 2) {
            item.current.click();
            return false; // Remove this item from the array
          }
          return true; // Keep the rest
        });
      }
    }

    if (trigger === "click") {
      setIsOpen((prev) => !prev);
    }
  }, [trigger, layoutSidebar, layoutType]);

  const handleMouseEnter = useCallback(() => {
    if (trigger === "hover") {
      setIsOpen(true);
    }
  }, [trigger]);

  const handleMouseLeave = useCallback(() => {
    if (trigger === "hover") {
      setIsOpen(false);
    }
  }, [trigger]);

  const handleKeyDown = useCallback((event: any) => {
    if (event.key === "Escape") {
      setIsOpen(false);
    }
  }, []);

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (
        closeOnOutsideClick &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    },
    [closeOnOutsideClick],
  );

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  });

  const handleClickOutsideSidebar = useCallback(
    (event: MouseEvent) => {
      const sidebar = document.querySelector("#main-sidebar");

      if (
        closeOnOutsideClickSidebar &&
        sidebar &&
        sidebar.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    },
    [closeOnOutsideClickSidebar],
  );

  useEffect(() => {
    document.addEventListener("click", handleClickOutsideSidebar);
    return () => {
      document.removeEventListener("click", handleClickOutsideSidebar);
    };
  }, [handleClickOutsideSidebar]);
  useEffect(() => {
    if (
      layoutType === LAYOUT_TYPES.HORIZONTAL ||
      layoutSidebar === SIDEBAR_SIZE.SMALL
    ) {
      setIsOpen(false);
    }
    const Screensize = window.innerWidth <= 768;
    if (Screensize && toggleSidebar && isOpen) {
      toggleSidebar();
      setIsOpen(false);
    }
  }, [pathname]);
  //function
  const getDefault = (buttonRect: DOMRect, dropdown: HTMLElement) => {
    let data = { left: 0, top: 0 };
    const dropdownWidth = dropdown.offsetWidth;
    const dropdownHeight = dropdown.offsetHeight;

    const yTSpace = buttonRect.top;
    const yBSpace = window.innerHeight - buttonRect.bottom;
    const xRSpace = window.innerWidth - buttonRect.left;
    const xLSpace = buttonRect.left;
    data.left =
      xRSpace >= dropdownWidth
        ? buttonRect.left
        : buttonRect.right - dropdownWidth;

    if (yBSpace >= dropdownHeight) {
      data.top = buttonRect.bottom;
    } else if (yTSpace >= dropdownHeight) {
      data.top = buttonRect.top - dropdown.offsetHeight;
    } else {
      data.top = buttonRect.top;
      if (xRSpace >= dropdownWidth) {
        data.left = buttonRect.right;
      } else if (xLSpace >= dropdownWidth) {
        data.left = buttonRect.left - dropdown.offsetWidth;
      } else {
        data.left = buttonRect.right;
      }
    }
    return data;
  };

  const getRight = (buttonRect: DOMRect, dropdown: HTMLElement) => {
    let data = { left: 0, top: 0 };
    const dropdownWidth = dropdown.offsetWidth;
    const dropdownHeight = dropdown.offsetHeight;

    const yTSpace = buttonRect.top;
    const yBSpace = window.innerHeight - buttonRect.bottom;
    const xLSpace = buttonRect.right;

    // In RTL mode, we want to position from the left edge
    if (isRTL) {
      data.left = buttonRect.left;
    } else {
      data.left = xLSpace < dropdownWidth
        ? buttonRect.left
        : buttonRect.right - dropdownWidth;
    }

    if (yBSpace >= dropdownHeight) {
      data.top = buttonRect.bottom;
    } else if (yTSpace >= dropdownHeight) {
      data.top = buttonRect.top - dropdown.offsetHeight;
    } else {
      data.top = buttonRect.top;
      if (!isRTL && xLSpace - buttonRect.width > dropdownWidth) {
        data.left = buttonRect.left - dropdown.offsetWidth;
      } else if (!isRTL) {
        data.left = buttonRect.right;
      }
    }
    return data;
  };

  const getTopRight = (buttonRect: DOMRect, dropdown: HTMLElement) => {
    let data = { left: 0, top: 0 };
    const dropdownWidth = dropdown.offsetWidth;
    const dropdownHeight = dropdown.offsetHeight;

    const yTSpace = buttonRect.bottom;
    const yBSpace = window.innerHeight - buttonRect.top;
    const xRSpace = window.innerWidth - buttonRect.right;
    const xLSpace = buttonRect.left;

    if (yBSpace >= dropdownHeight) {
      data.top = buttonRect.top;
    } else if (yTSpace >= dropdownHeight) {
      data.top = buttonRect.bottom - dropdown.offsetHeight;
    } else {
      data.top = buttonRect.top;
    }
    if (xRSpace >= dropdownWidth) {
      data.left = buttonRect.right;
    } else if (xLSpace >= dropdownWidth) {
      data.left = buttonRect.left - dropdown.offsetWidth;
    } else {
      data.left = buttonRect.right;
    }

    return data;
  };

  const getRightLeft = (buttonRect: DOMRect, dropdown: HTMLElement) => {
    let data = {
      left: 0,
      top: 0,
    };
    if (buttonRect.x - dropdown.offsetWidth < 0) {
      data.top = buttonRect.bottom;
      data.left = buttonRect.left;
    }
    if (window.innerHeight < buttonRect.top + dropdown.offsetHeight) {
      data.top = buttonRect.top - dropdown.offsetHeight;
      data.left = buttonRect.left;
    }
    return data;
  };

  useEffect(() => {
    if (position === "top-right" || position === "right") {
      setIsOpen(isActive ? isActive : false);
    } else {
      setIsOpen(false);
    }
  }, [position, trigger, isActive]);

  const calculatePosition = useCallback(() => {
    if (!dropdownRef.current || !menuRef.current) {
      return;
    }

    const buttonRect =
      dropdownRef.current.getBoundingClientRect() ||
      dropdownRef.current.closest(".dropdown")?.getBoundingClientRect();
    let dropdownPosition = { left: 0, top: 0 };
    switch (position) {
      case "right":
        dropdownPosition = getRight(buttonRect, menuRef.current);
        break;
      case "top-right":
        dropdownPosition = getTopRight(buttonRect, menuRef.current);
        break;
      case "top-left":
        dropdownPosition = getRightLeft(buttonRect, menuRef.current);
        break;
      default:
        dropdownPosition = getDefault(buttonRect, menuRef.current);
        break;
    }

    menuRef.current.style.left = `${Math.max(0, dropdownPosition.left)}px`;
    menuRef.current.style.top = `${Math.max(0, dropdownPosition.top)}px`;
  }, [position]);

  useEffect(() => {
    calculatePosition();
  }, [isOpen, calculatePosition]);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <DropdownContext.Provider
      value={{
        isOpen,
        setIsOpen,
        position,
        trigger,
        close,
        calculatePosition,
        menuRef,
      }}
    >
      <div
        ref={dropdownRef}
        className={`${dropdownClassName}`}
        onClick={handleToggle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onKeyDown={handleKeyDown}
      >
        {children}
      </div>
    </DropdownContext.Provider>
  );
};
interface DropdownButtonProps {
  children: React.ReactNode;
  colorClass?: string;
  arrow?: boolean;
  isActive?: boolean;
}
const DropdownButton: React.FC<DropdownButtonProps> = ({
  children,
  colorClass,
  arrow,
}) => {
  const context = useContext(DropdownContext);

  if (!context) {
    throw new Error("DropdownButton must be used within a Dropdown");
  }

  const { isOpen } = context;

  return (
    <button className={`${colorClass}`} type="button">
      {children}
      {arrow && (
        <svg
          className={`size-5 arrow ${isOpen ? "transform rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </button>
  );
};
interface DropdownMenuProps {
  children: React.ReactNode;
  menuclass?: any;
  handleMenuClick?: (event: React.MouseEvent) => void;
  sidebar?: boolean;
}
const DropdownMenu: React.FC<DropdownMenuProps> = ({
  children,
  menuclass,
  handleMenuClick,
  sidebar,
}) => {
  const context = useContext(DropdownContext);

  if (!context) {
    throw new Error("DropdownMenu must be used within a Dropdown");
  }
  const { isOpen, menuRef } = context;
  return (
    isOpen && (
      <div
        ref={menuRef}
        className={`${sidebar ? "" : "!fixed"} dropdown-menu ${menuclass}`}
        style={{ transition: "opacity 0.2s" }}
        onClick={handleMenuClick}
      >
        {children}
      </div>
    )
  );
};
interface DropdownItemProps {
  children: React.ReactNode;
  href?: string;
  className?: string;
}
const DropdownItem: React.FC<DropdownItemProps> = ({
  children,
  href,
  className,
}) => {
  return (
    <li>
      <Link to={href || "#"} className={`dropdown-item ${className}`}>
        {children}
      </Link>
    </li>
  );
};

export {
  Dropdown,
  DropdownButton,
  DropdownMenu,
  DropdownItem,
  DropdownContext,
};
