import FullCalendar from "@fullcalendar/react";
import React, { useEffect } from "react";
import interactionPlugin from "@fullcalendar/interaction";
import dayGridPlugin from "@fullcalendar/daygrid";
import BreadCrumb from "@src/components/common/breadCrumb";
import { NextPageWithLayout } from "@src/dtos";

const CalendarWeekNumber: NextPageWithLayout = () => {
  useEffect(() => {
    document.title =
      "Week Number | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      <BreadCrumb title="Week Number" subTitle="Calendar" />
      <div className="card">
        <div className="card-body">
          <div id="weekNumberCalendar">
            <FullCalendar
              plugins={[interactionPlugin, dayGridPlugin]}
              initialView="dayGridMonth"
              timeZone="America/New_York"
              weekNumbers={true}
            />
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default CalendarWeekNumber;
