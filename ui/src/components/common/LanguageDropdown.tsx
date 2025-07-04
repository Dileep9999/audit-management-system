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
import LanguageSyncService from "@src/utils/language_sync_service";

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
  const changeLanguage = async (lng: LAYOUT_LANGUAGES) => {
    // Prevent rapid clicks
    if (lng === layoutLanguages) {
      console.log('Language already set to:', lng);
      return;
    }

    try {
      console.log('Changing language to:', lng);
      
      // Use language sync service to update both Django and React
      await LanguageSyncService.getInstance().changeLanguage(lng);
      
      // Also update i18n for immediate translation changes
      i18n.changeLanguage(lng);
      
      console.log('Language changed successfully:', lng);
    } catch (error) {
      console.error('Failed to change language:', error);
      // Fallback to local change only
      i18n.changeLanguage(lng);
      dispatch(changeDirection(lng === LAYOUT_LANGUAGES.ARABIC ? LAYOUT_DIRECTION.RTL : LAYOUT_DIRECTION.LTR));
      dispatch(changeLayoutLanguage(lng));
    }
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
