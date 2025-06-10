import FullCalendar from "@fullcalendar/react";
import React, { useEffect, useRef } from "react";
import dayGridPlugin from "@fullcalendar/daygrid";
import BreadCrumb from "@src/components/common/breadCrumb";
import { NextPageWithLayout } from "@src/dtos";

const CalendarDayView: NextPageWithLayout = () => {
  const calendarRef = useRef<FullCalendar>(null);

  useEffect(() => {
    document.title =
      "Day Grid View | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      <BreadCrumb title="Day Grid View" subTitle="Calendar" />
      <div className="card">
        <div className="card-body">
          <div id="dayGridViewCalendar">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin]}
              initialView="dayGridWeek"
              timeZone="America/New_York"
              headerToolbar={{
                left: "prev,next",
                center: "title",
                right: "dayGridWeek,dayGridDay",
              }}
            />
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default CalendarDayView;
