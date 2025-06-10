import React from "react";
import SimpleBar from "simplebar-react";
import { useSelector, useDispatch } from "react-redux";
import i18n from "@src/utils/i18n";
import {
  Dropdown,
  DropdownButton,
  DropdownMenu,
} from "../custom/dropdown/dropdown";
import { Link } from "react-router-dom";
import { LAYOUT_LANGUAGES, LAYOUT_DIRECTION } from "@src/components/constants/layout";
import { RootState, AppDispatch } from "src/slices/reducer";
import { changeDirection, changeLayoutLanguage } from "@src/slices/thunk";

const LanguageDropdown = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { layoutLanguages } = useSelector((state: RootState) => state.Layout);

  // Simplified language options
  const languages = [
    { code: LAYOUT_LANGUAGES.ENGLISH, language: "English", flag: "https://images.kcubeinfotech.com/domiex/images/flag/us.svg" },
    { code: LAYOUT_LANGUAGES.ARABIC, language: "Arabic", flag: "https://images.kcubeinfotech.com/domiex/images/flag/sa.svg" }
  ];

  // get country flag
  const getCountryFlag = (code: string) => {
    return languages.find((item) => item.code === code)?.flag;
  };

  // change language and direction
  const changeLanguage = (lng: LAYOUT_LANGUAGES) => {
    i18n.changeLanguage(lng);
    // Change direction based on language
    dispatch(changeDirection(lng === LAYOUT_LANGUAGES.ARABIC ? LAYOUT_DIRECTION.RTL : LAYOUT_DIRECTION.LTR));
    // Update the language in the store
    dispatch(changeLayoutLanguage(lng));
  };

  return (
    <React.Fragment>
      <Dropdown position="right" trigger="click" dropdownClassName="dropdown">
        <DropdownButton colorClass="topbar-link">
          <img
            src={
              getCountryFlag(layoutLanguages) ||
              "https://images.kcubeinfotech.com/domiex/images/flag/us.svg"
            }
            alt="flag"
            className="object-cover rounded-md size-6"
            width={24}
            height={24}
          />
        </DropdownButton>

        <DropdownMenu>
          <SimpleBar className="max-h-[calc(100vh_-_100px)]">
            {languages.map((value, key) => (
              <Link
                to="#!"
                className="dropdown-item"
                key={key}
                onClick={() => changeLanguage(value.code)}
              >
                <img
                  src={value.flag}
                  alt={value.language}
                  className="object-cover rounded-md size-5"
                  width={20}
                  height={20}
                />
                <span>{value.language}</span>
              </Link>
            ))}
          </SimpleBar>
        </DropdownMenu>
      </Dropdown>
    </React.Fragment>
  );
};

export default LanguageDropdown;
