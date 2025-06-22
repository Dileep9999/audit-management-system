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
import { LAYOUT_LANGUAGES } from "./components/constants/layout";
import { initialState } from "./slices/layout/reducer";

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
      changeDirection(
        getPreviousStorageData("data-layout-direction") ??
          initialState.layoutDirection,
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
      changeLayoutLanguage(
        getPreviousStorageData("data-layout-language") ??
          LAYOUT_LANGUAGES.ENGLISH,
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
