import FullCalendar from "@fullcalendar/react";
import React, { useEffect } from "react";
import interactionPlugin from "@fullcalendar/interaction";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import BreadCrumb from "@src/components/common/breadCrumb";
import { NextPageWithLayout } from "@src/dtos";

const CalendarDateNavLink: NextPageWithLayout = () => {
  useEffect(() => {
    document.title =
      "Date Nav Link | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      <BreadCrumb title="Date Nav Link" subTitle="Calendar" />
      <div className="card">
        <div className="card-body">
          <div id="dateNavLinkCalendar">
            <FullCalendar
              plugins={[interactionPlugin, dayGridPlugin, timeGridPlugin]}
              editable={true}
              navLinks={true}
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay",
              }}
              events="https://fullcalendar.io/api/demo-feeds/events.json?single-day&for-resource-timeline"
            />
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default CalendarDateNavLink;
