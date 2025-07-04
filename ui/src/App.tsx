import "flatpickr/dist/flatpickr.css";
import "simplebar-react/dist/simplebar.min.css";
import "@assets/css/tailwind.css";
import "@assets/css/icons.css";
import "@assets/css/fonts/fonts.css";
import "./assets/css/plugins.css";

import React, { useEffect } from "react";
import { getPreviousStorageData } from "./slices/layout/utils"; // Adjust the path if needed
import { withTranslation } from "react-i18next";
import store, { AppDispatch } from "./slices/reducer";
import AuthProvider from "./components/AuthProvider";
import { Toaster } from 'react-hot-toast';
import LanguageSyncService from "./utils/language_sync_service";

import {
  changeLayoutMode,
  changeLayoutContentWidth,
  changeSidebarSize,
  changeDirection,
  changeLayout,
  changeSidebarColor,
  changeDataColor,
  changeLayoutLanguage,
  changeModernNavigation,
  changeDarkModeClass,
} from "./slices/thunk";

import Routing from "./routes";
import { LAYOUT_LANGUAGES, LAYOUT_DIRECTION } from "./components/constants/layout";
import { initialState } from "./slices/layout/reducer";

function getDjangoLanguageCookie() {
  const cookies = document.cookie.split(';');
  const languageCookie = cookies.find(cookie => cookie.trim().startsWith('django_language='));
  if (languageCookie) {
    return languageCookie.split('=')[1]?.trim() || null;
  }
  return null;
}

function getReduxLanguageFromCookie(cookieLang: string | null): LAYOUT_LANGUAGES {
  switch ((cookieLang || '').toLowerCase()) {
    case 'ar': return LAYOUT_LANGUAGES.ARABIC;
    case 'en':
    default: return LAYOUT_LANGUAGES.ENGLISH;
  }
}

function getDirectionForLanguage(lang: LAYOUT_LANGUAGES): LAYOUT_DIRECTION {
  return lang === LAYOUT_LANGUAGES.ARABIC ? LAYOUT_DIRECTION.RTL : LAYOUT_DIRECTION.LTR;
}

function App() {
  useEffect(() => {
    const htmlElement = document.documentElement;
    htmlElement.classList.add("scroll-smooth", "group");
    return () => {
      htmlElement.classList.remove("scroll-smooth", "group");
    };
  }, []);

  useEffect(() => {
    const dispatch = store.dispatch as AppDispatch;

    // Read django_language cookie ONCE on app load
    const cookieLang = getDjangoLanguageCookie();
    const reduxLang = getReduxLanguageFromCookie(cookieLang);
    const direction = getDirectionForLanguage(reduxLang);

    dispatch(changeLayoutLanguage(reduxLang));
    dispatch(changeDirection(direction));

    // Initialize layout settings from storage
    dispatch(
      changeLayoutMode(
        getPreviousStorageData("data-layout-mode") ?? initialState.layoutMode,
      ),
    );
    dispatch(
      changeLayoutContentWidth(
        getPreviousStorageData("data-layout-content-width") ??
          initialState.layoutWidth,
      ),
    );
    dispatch(
      changeSidebarSize(
        getPreviousStorageData("data-sidebar-size") ??
          initialState.layoutSidebar,
      ),
    );
    dispatch(
      changeLayout(
        getPreviousStorageData("data-layout-type") ?? initialState.layoutType,
      ),
    );
    dispatch(
      changeSidebarColor(
        getPreviousStorageData("data-sidebar-colors") ??
          initialState.layoutSidebarColor,
      ),
    );
    dispatch(
      changeDataColor(
        getPreviousStorageData("data-theme-color") ??
          initialState.layoutDataColor,
      ),
    );
    dispatch(
      changeDarkModeClass(
        getPreviousStorageData("data-theme-dark-class") ??
          initialState.layoutDarkModeClass,
      ),
    );
    dispatch(
      changeModernNavigation(
        getPreviousStorageData("data-theme-nav-type") ??
          initialState.layoutNavigation,
      ),
    );
  }, []);

  return (
      <AuthProvider>
      <Toaster position="top-right" />
        <Routing />
      </AuthProvider>
  );
}

export default withTranslation()(App);
