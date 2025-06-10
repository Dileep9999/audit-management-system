import {
  Dropdown,
  DropdownButton,
  DropdownMenu,
} from "@src/components/custom/dropdown/dropdown";
import React from "react";
import { Link } from "react-router-dom";

type PositionDropdownProps = {
  data: DropdownItem[];
};

type DropdownItem = {
  id: number;
  text: string;
  textColor?: string;
  spantextColor?: string;
};

const PositionDropdown: React.FC<PositionDropdownProps> = ({ data }) => {
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

      <Dropdown position="right" trigger="click" dropdownClassName="dropdown">
        <DropdownButton
          colorClass="flex items-center gap-2 btn-sub-gray btn"
          arrow={true}
        >
          {" "}
          Right Dropdown
        </DropdownButton>
        <DropdownMenu>
          {data.map((item) => (
            <Link to="#" className="dropdown-item" key={item.id}>
              <span className={item.spantextColor}>{item.text}</span>
            </Link>
          ))}
        </DropdownMenu>
      </Dropdown>

      <Dropdown
        position="top-right"
        trigger="click"
        dropdownClassName="dropdown"
      >
        <DropdownButton
          colorClass="flex items-center gap-2 btn-sub-gray btn"
          arrow={true}
        >
          {" "}
          Right Top Dropdown
        </DropdownButton>
        <DropdownMenu>
          {data.map((item) => (
            <Link to="#" className="dropdown-item" key={item.id}>
              <span className={item.spantextColor}>{item.text}</span>
            </Link>
          ))}
        </DropdownMenu>
      </Dropdown>

      <Dropdown
        position="top-right"
        trigger="click"
        dropdownClassName="dropdown"
      >
        <DropdownButton
          colorClass="flex items-center gap-2 btn-sub-gray btn"
          arrow={true}
        >
          {" "}
          Left Top Dropdown Options{" "}
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

export default PositionDropdown;
