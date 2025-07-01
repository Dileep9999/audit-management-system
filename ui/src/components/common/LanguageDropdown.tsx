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
import useTranslation from "@src/hooks/useTranslation";

const LanguageDropdown = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { layoutLanguages } = useSelector((state: RootState) => state.Layout);
  const { isRTL } = useTranslation();

  // Simplified language options - only EN and AR
  const languages = [
    { code: LAYOUT_LANGUAGES.ENGLISH, language: "English", label: "EN" },
    { code: LAYOUT_LANGUAGES.ARABIC, language: "Arabic", label: "AR" }
  ];

  // Get current language label
  const getCurrentLanguageLabel = (code: string) => {
    return languages.find((item) => item.code === code)?.label || "EN";
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
      <Dropdown position="right" trigger="click" dropdownClassName={`dropdown ${isRTL ? 'rtl-dropdown' : ''}`}>
        <DropdownButton colorClass="topbar-link">
          <span className="text-sm font-medium">
            {getCurrentLanguageLabel(layoutLanguages)}
          </span>
        </DropdownButton>

        <DropdownMenu>
          <SimpleBar className="max-h-[calc(100vh_-_100px)]">
            {languages.map((value, key) => (
              <Link
                to="#!"
                className={`dropdown-item ${isRTL ? 'rtl-content' : ''}`}
                key={key}
                onClick={() => changeLanguage(value.code)}
              >
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
