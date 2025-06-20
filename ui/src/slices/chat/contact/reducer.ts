import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import LoadingToast from "@src/components/custom/toast/loadingToast";
import { ContactChatRecord } from "@src/dtos";
import { initStore } from "@src/utils/init_store";

interface ContactChatState {
  contactList: ContactChatRecord[] | null;
  isLoading: boolean;
}

const initialState: ContactChatState = {
  contactList: initStore("d-contact-chat-list"),
  isLoading: false,
};

const ListSlice = createSlice({
  name: "contact_chat_list",
  initialState,
  reducers: {
    // get contact list
    getContactChatList(state, action: PayloadAction<ContactChatRecord[]>) {
      state.contactList = action.payload;
    },

    // delete contact record list
    deleteContactChatList(state, action: PayloadAction<number[]>) {
      if (state.contactList !== null) {
        state.contactList = state.contactList.filter(
          (item) => !action.payload.includes(item._id),
        );
      }
    },

    // edit contact chat list
    editContactChatRecord(state, action: PayloadAction<ContactChatRecord>) {
      const contact = action.payload;
      if (state.contactList !== null) {
        const findCustomerIndex = state.contactList.findIndex(
          (item) =>
            item.roomId === contact._id && item.roomId === contact.roomId,
        );
        if (findCustomerIndex !== -1) {
          state.contactList[findCustomerIndex] = contact;
          LoadingToast();
        }
      }
    },

    // add contact chat product list
    addContactChatRecord(state, action: PayloadAction<ContactChatRecord>) {
      const newContact = action.payload;
      if (state.contactList !== null) {
        state.contactList.unshift(newContact);
      } else {
        state.contactList = [newContact];
      }
    },
  },
});

export const {
  getContactChatList,
  deleteContactChatList,
  editContactChatRecord,
  addContactChatRecord,
} = ListSlice.actions;
export default ListSlice.reducer;
