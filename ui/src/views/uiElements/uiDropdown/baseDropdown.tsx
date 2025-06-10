import {
  Dropdown,
  DropdownButton,
  DropdownMenu,
} from "@src/components/custom/dropdown/dropdown";
import React from "react";
import { Link } from "react-router-dom";

type DropdownItem = {
  id: number;
  text: string;
  textColor?: string;
  spantextColor?: string;
};

// Type the props of the ColoredDropdown component
type BaseDropdownProps = {
  data: DropdownItem[];
};

const BaseDropdown: React.FC<BaseDropdownProps> = ({ data }) => {
  return (
    <React.Fragment>
      <Dropdown trigger="click" dropdownClassName="dropdown">
        <DropdownButton
          colorClass="flex items-center gap-2 btn-sub-gray btn"
          arrow={true}
        >
          {" "}
          Dropdown Options
        </DropdownButton>
        <DropdownMenu>
          {data.map((item) => (
            <Link to="#" className="dropdown-item" key={item.id}>
              <span className={item.spantextColor}>{item.text}</span>
            </Link>
          ))}
        </DropdownMenu>
      </Dropdown>

      <Dropdown position="" trigger="click" dropdownClassName="dropdown">
        <DropdownButton colorClass="flex items-center gap-2" arrow={true}>
          {" "}
          Dropdown Link Options
        </DropdownButton>
        <DropdownMenu>
          {data.map((item) => (
            <Link to="#" className="dropdown-item" key={item.id}>
              <span className={item.spantextColor}>{item.text}</span>
            </Link>
          ))}
        </DropdownMenu>
      </Dropdown>
    </React.Fragment>
  );
};
export default BaseDropdown;
