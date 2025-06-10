import FullCalendar from "@fullcalendar/react";
import React, { useEffect, useRef, useState } from "react";
import interactionPlugin from "@fullcalendar/interaction";
import dayGridPlugin from "@fullcalendar/daygrid";
import allLocales from "@fullcalendar/core/locales-all";
import BreadCrumb from "@src/components/common/breadCrumb";
import Select from "react-select";
import { NextPageWithLayout } from "@src/dtos";

const localesOptions = [
  { label: "English (EN-AU)", value: "en-au" },
  { label: "Arabic (AR)", value: "ar" },
  { label: "German (DE)", value: "de" },
  { label: "Russian (RU)", value: "ru" },
  { label: "French (FR)", value: "fr" },
  { label: "Italian (IT)", value: "it" },
  { label: "Danish (DA)", value: "da" },
  { label: "Chinese (ZH)", value: "zh" },
  { label: "Korean (KO)", value: "ko" },
  { label: "Greek (EL)", value: "el" },
  { label: "Finnish (FI)", value: "fi" },
  { label: "Persian (FA)", value: "fa" },
  { label: "Catalan, Valencian (CA)", value: "ca" },
];

const CalendarLocalize: NextPageWithLayout = () => {
  const calendarRef = useRef<FullCalendar>(null);
  const [locale, setLocale] = useState<string>("en");

  useEffect(() => {
    document.title = "Localize | Domiex - React TS Admin & Dashboard Template";
  }, []);

  // Handle locale change
  const handleLocaleChange = (event: any) => {
    const selectedLocale = event;
    setLocale(selectedLocale);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setLocale("en-au");
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <React.Fragment>
      <BreadCrumb title="Localize" subTitle="Calendar" />
      <div className="card">
        <div className="card-header">
          <div id="localizeSelect">
            <div>
              <Select
                id="localizeSelect"
                classNamePrefix="select"
                options={localesOptions}
                getOptionValue={(option) => option.value}
                getOptionLabel={(option) => option.label}
                onChange={(event) => handleLocaleChange(event?.value)}
              />
            </div>
          </div>
        </div>
        <div className="card-body">
          <div id="localizeCalendar">
            <div>
              <FullCalendar
                ref={calendarRef}
                plugins={[interactionPlugin, dayGridPlugin]}
                initialView="dayGridMonth"
                timeZone="America/New_York"
                locales={allLocales}
                locale={locale}
                weekNumbers={false}
              />
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default CalendarLocalize;
