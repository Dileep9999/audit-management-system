import FullCalendar from "@fullcalendar/react";
import React, { useEffect } from "react";
import multiMonthPlugin from "@fullcalendar/multimonth";
import BreadCrumb from "@src/components/common/breadCrumb";
import { NextPageWithLayout } from "@src/dtos";

const CalendarMultiMonthStack: NextPageWithLayout = () => {
  useEffect(() => {
    document.title =
      "Multi-Month Stack | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      <BreadCrumb title="Multi-Month Stack" subTitle="Calendar" />
      <div className="card">
        <div className="card-body">
          <div id="multiMonthStackCalendar">
            <FullCalendar
              plugins={[multiMonthPlugin]}
              initialView="multiMonthYear"
              multiMonthMaxColumns={1}
            />
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default CalendarMultiMonthStack;
