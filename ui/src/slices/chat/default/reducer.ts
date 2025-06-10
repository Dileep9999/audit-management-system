import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import LoadingToast from "@src/components/custom/toast/loadingToast";
import { UserChatMessageRecord, UserChatRecord } from "@src/dtos";
import { initStore } from "@src/utils/init_store";

interface DefaultChatState {
  defaultChatList: UserChatRecord[] | null;
  isLoading: boolean;
  currentContactChat: UserChatRecord | null;
}

const initialState: DefaultChatState = {
  defaultChatList: initStore("d-default-chat"),
  isLoading: false,
  currentContactChat: null,
};

const ListSlice = createSlice({
  name: "default_chat_list",
  initialState,
  reducers: {
    // get default chat list
    getChatList(state, action: PayloadAction<UserChatRecord[]>) {
      state.defaultChatList = action.payload;
    },

    // set current chat record
    setCurrentChatRecord(state, action: PayloadAction<UserChatRecord>) {
      state.currentContactChat = action.payload;
    },

    // delete default chat record
    deleteDefaultChatListRecord(state, action: PayloadAction<number[]>) {
      if (state.defaultChatList !== null) {
        state.defaultChatList = state.defaultChatList.filter(
          (item) => !action.payload.includes(item._id),
        );
        state.currentContactChat = state.defaultChatList[action.payload[0] - 1];
      }
    },

    // edit chat record
    editDefaultChatListRecord(state, action: PayloadAction<UserChatRecord>) {
      const chat = action.payload;
      if (state.defaultChatList !== null) {
        const findChatIndex = state.defaultChatList.findIndex(
          (item) => item._id === chat._id,
        );
        if (findChatIndex !== -1) {
          state.defaultChatList[findChatIndex] = chat;
          state.currentContactChat = chat;
        }
        LoadingToast();
      }
    },

    // add customer product list
    addChatListRecord(state, action: PayloadAction<UserChatRecord>) {
      const newContact = action.payload;
      if (state.defaultChatList !== null) {
        state.defaultChatList.unshift(newContact);
        state.currentContactChat = newContact;
      } else {
        state.defaultChatList = [newContact];
        state.currentContactChat = newContact;
      }
    },

    // delete message record
    deleteChatMessageRecord(
      state,
      action: PayloadAction<{ _id: number; message: UserChatMessageRecord }>,
    ) {
      const { _id, message } = action.payload;
      if (state.defaultChatList !== null) {
        const findRecordIndex = state.defaultChatList.findIndex(
          (item: UserChatRecord) => item._id === _id,
        );
        const findRecord = state.defaultChatList.find(
          (item: UserChatRecord) => item._id === _id,
        );
        if (findRecordIndex !== -1 && findRecord) {
          const updatedMessages =
            findRecord.messages.filter(
              (msg: UserChatMessageRecord) => msg._id !== message._id,
            ) || [];
          state.defaultChatList[findRecordIndex] = {
            ...findRecord,
            messages: updatedMessages,
          };
          state.currentContactChat = {
            ...findRecord,
            messages: updatedMessages,
          };
        }
      }
    },

    // add new message
    addChatNewMessageRecord(
      state,
      action: PayloadAction<{ _id: number; message: UserChatMessageRecord }>,
    ) {
      const { _id, message } = action.payload;
      if (state.defaultChatList !== null) {
        const findRecordIndex = state.defaultChatList.findIndex(
          (item: UserChatRecord) => item._id === _id,
        );
        const findRecord = state.defaultChatList.find(
          (item: UserChatRecord) => item._id === _id,
        );
        if (findRecordIndex !== -1 && findRecord) {
          const updatedMessages = [...findRecord.messages, message];
          state.defaultChatList[findRecordIndex] = {
            ...findRecord,
            messages: updatedMessages,
          };
          state.currentContactChat = {
            ...findRecord,
            messages: updatedMessages,
          };
        }
      }
    },
  },
});

export const {
  getChatList,
  setCurrentChatRecord,
  deleteDefaultChatListRecord,
  editDefaultChatListRecord,
  addChatListRecord,
  deleteChatMessageRecord,
  addChatNewMessageRecord,
} = ListSlice.actions;
export default ListSlice.reducer;
