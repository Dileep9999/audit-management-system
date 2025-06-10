interface Guest {
  name: string;
  email: string;
  // Add other guest-related properties here as needed
}

interface ExtendedProps {
  guests: Guest[]; // Array of guests with name and email properties
  location: string;
}

// events
export interface EventItem {
  _id?: number;

  id?: number;
  title: any;
  start: string;
  end: string;
  eventTime: string;
  classNames: string[];
  extendedProps: {
    guests: any;
    location: any;
  };
}
