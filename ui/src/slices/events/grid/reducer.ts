import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import LoadingToast from "@src/components/custom/toast/loadingToast";
import { EventGrid } from "@src/dtos";
import { initStore } from "@src/utils/init_store";

interface gridState {
  eventGrid: EventGrid[] | null;
  islodaing: boolean;
}

const initialState: gridState = {
  eventGrid: initStore("d-events-grid"),
  islodaing: false,
};

const EventGridSlice = createSlice({
  name: "event_grid",
  initialState,
  reducers: {
    // get event grid data
    getEventGrid(state, action: PayloadAction<EventGrid[]>) {
      state.eventGrid = action.payload;
    },

    // add new event grid
    addEventGrid(state, action: PayloadAction<EventGrid>) {
      const newEvent = action.payload;
      if (state.eventGrid !== null) {
        state.eventGrid.unshift(newEvent);
      } else {
        state.eventGrid = [newEvent];
      }
    },

    // update event grid
    editEventGrid(state, action: PayloadAction<EventGrid>) {
      const eventsGrid = action.payload;
      if (state.eventGrid !== null) {
        const findGridIndex = state.eventGrid.findIndex(
          (item) => item._id === eventsGrid._id,
        );
        const findGridRecord = state.eventGrid.find(
          (item) => item._id === eventsGrid._id,
        );
        if (findGridIndex !== -1 && findGridRecord) {
          state.eventGrid[findGridIndex] = eventsGrid;
        }
        LoadingToast();
      }
    },

    // delete event grid
    deleteEventGrid(state, action: PayloadAction<number[]>) {
      if (state.eventGrid !== null) {
        state.eventGrid = state.eventGrid.filter(
          (item) => !action.payload.includes(item._id),
        );
      }
    },
  },
});

export const { getEventGrid, addEventGrid, editEventGrid, deleteEventGrid } =
  EventGridSlice.actions;
export default EventGridSlice.reducer;
