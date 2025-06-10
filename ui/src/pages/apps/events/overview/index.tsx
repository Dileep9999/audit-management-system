import InvitationStatus from "@src/views/apps/event/overview/invitationStatus";
import React, { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import EventDetails from "@src/views/apps/event/overview/eventDetails";
import TicketSale from "@src/views/apps/event/overview/ticketSale";
import Location from "@src/views/apps/event/overview/location";
import BookNow from "@src/views/apps/event/overview/bookNow";
import BreadCrumb from "@src/components/common/breadCrumb";
import { NextPageWithLayout } from "@src/dtos";

const EventOverview: NextPageWithLayout = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    document.title = "Overview | Domiex - React TS Admin & Dashboard Template";
  }, []);

  const handleModal = () => {
    setShow(!show);
  };
  return (
    <React.Fragment>
      <BreadCrumb title="Overview" subTitle="Events" />
      <div className="grid grid-cols-12 gap-x-5">
        <EventDetails handleModal={handleModal} />
        <div className="col-span-12 xl:col-span-4 2xl:col-span-3">
          <button type="button" className="w-full btn btn-primary">
            <Pencil className="inline-block ltr:mr-1 rtl:ml-1 size-4" /> Edit
            Event
          </button>
          <InvitationStatus />
          <TicketSale />
          <Location />
          <BookNow show={show} closedModal={handleModal} />
        </div>
      </div>
    </React.Fragment>
  );
};

export default EventOverview;
