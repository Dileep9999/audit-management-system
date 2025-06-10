import FullCalendar from "@fullcalendar/react";
import React, { useEffect } from "react";
import interactionPlugin from "@fullcalendar/interaction";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import BreadCrumb from "@src/components/common/breadCrumb";
import { NextPageWithLayout } from "@src/dtos";

const CalendarDateClicking: NextPageWithLayout = () => {
  // Handle date click event
  const handleDateClick = (info: any) => {
    alert("clicked " + info.dateStr);
  };
  const handleSelect = (info: any) => {
    alert("selected " + info.startStr + " to " + info.endStr);
  };

  useEffect(() => {
    document.title =
      "Date Clicking & Selecting | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      <BreadCrumb title="Date Clicking & Selecting" subTitle="Calendar" />
      <div className="card">
        <div className="card-body">
          <div id="dateClickingSelectingCalendar">
            <FullCalendar
              plugins={[interactionPlugin, dayGridPlugin, timeGridPlugin]}
              selectable={true}
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay",
              }}
              dateClick={handleDateClick}
              select={handleSelect}
            />
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default CalendarDateClicking;
