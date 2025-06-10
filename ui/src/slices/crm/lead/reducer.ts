import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import LoadingToast from "@src/components/custom/toast/loadingToast";
import { LeadItem } from "@src/dtos";
import { initStore } from "@src/utils/init_store";

interface LeadState {
  lead: LeadItem[];
  isLoading: boolean;
}

const initialState: LeadState = {
  lead: initStore("d-crm-lead-list"),
  isLoading: false,
};

const LeadSlice = createSlice({
  name: "lead",
  initialState,
  reducers: {
    // get lead list data
    getLeadList(state, action: PayloadAction<LeadItem[]>) {
      state.lead = action.payload;
    },

    // delete lead record
    deleteLeadList(state, action: PayloadAction<number[]>) {
      if (state.lead !== null) {
        state.lead = state.lead.filter(
          (item) => !action.payload.includes(item._id),
        );
      }
    },

    // edit lead record
    editLeadList(state, action: PayloadAction<LeadItem>) {
      const lead = action.payload;
      if (state.lead !== null) {
        const findLeadIndex = state.lead.findIndex(
          (item) => item._id === lead._id,
        );
        const findLeadRecord = state.lead.find((item) => item._id === lead._id);
        if (findLeadIndex !== -1 && findLeadRecord) {
          state.lead[findLeadIndex] = lead;
        }
        LoadingToast();
      }
    },

    // add new lead record
    addLeadList(state, action: PayloadAction<LeadItem>) {
      const newLead = action.payload;
      if (state.lead !== null) {
        state.lead.unshift(newLead);
      } else {
        state.lead = [newLead];
      }
    },
  },
});

export const { getLeadList, addLeadList, editLeadList, deleteLeadList } =
  LeadSlice.actions;
export default LeadSlice.reducer;
