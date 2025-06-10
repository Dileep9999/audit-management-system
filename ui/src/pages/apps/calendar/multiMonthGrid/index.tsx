import FullCalendar from "@fullcalendar/react";
import React, { useEffect } from "react";
import multiMonthPlugin from "@fullcalendar/multimonth";
import BreadCrumb from "@src/components/common/breadCrumb";
import { NextPageWithLayout } from "@src/dtos";

const CalendarMultiMonthGrid: NextPageWithLayout = () => {
  useEffect(() => {
    document.title =
      "Multi-Month grid | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      <BreadCrumb title="Multi-Month grid" subTitle="Calendar" />
      <div className="card">
        <div className="card-body">
          <div id="multiMonthGridCalendar">
            <FullCalendar
              plugins={[multiMonthPlugin]}
              themeSystem="sketchy"
              initialView="multiMonthYear"
            />
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default CalendarMultiMonthGrid;
