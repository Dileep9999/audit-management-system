import BreadCrumb from "@src/components/common/breadCrumb";
import { GroupChatRecord, NextPageWithLayout } from "@src/dtos";
import { AppDispatch, RootState } from "@src/slices/reducer";
import {
  deleteGroupChatRecordData,
  getGroupChatData,
  setCurrentGroupChatListRecord,
} from "@src/slices/thunk";
import AddNewGroupModal from "@src/views/apps/chat/group/addNewGroupModal";
import DeleteGroupModal from "@src/views/apps/chat/group/deleteGroupModal";
import GroupChatBoard from "@src/views/apps/chat/group/groupChatBoard";
import GroupChatList from "@src/views/apps/chat/group/groupChatList";
import GroupInfo from "@src/views/apps/chat/group/groupInfo";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const Group: NextPageWithLayout = () => {
  useEffect(() => {
    document.title =
      "Group Chat | Domiex - React TS Admin & Dashboard Template";
  }, []);

  const dispatch = useDispatch<AppDispatch>();
  const { groupChatList, currentGroupChatRecord } = useSelector(
    (state: RootState) => state.GroupChat,
  );

  const [allGroupChatRecords, setGroupChatRecords] = useState<
    GroupChatRecord[]
  >([]);
  const [searchGroup, setSearchGroup] = useState<string>("");
  const [isOpenAddNewGroupModal, setIsOpenAddNewGroupModal] =
    useState<boolean>(false);
  const [isAudioCallModalOpen, setIsAudioCallModalOpen] =
    useState<boolean>(false);

  const [isDeleteGroupModalOpen, setIsDeleteGroupModalOpen] =
    useState<boolean>(false);

  const [isMobileView, setIsMobileView] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<"chatList" | "chatBoard">(
    "chatList",
  );

  // Handle opening the "Add New Group" modal
  const handleAddNewGroupModal = (val: boolean) => {
    setIsOpenAddNewGroupModal(val);
  };

  // Handle audio call modal opening
  const handleOpenAudioCallModal = (value: boolean) => {
    setIsAudioCallModalOpen(value);
  };

  // Handle deleting the group chat record
  const handleDeleteGroupModal = () => {
    dispatch(deleteGroupChatRecordData([currentGroupChatRecord?._id]));
  };

  // Search groups
  const handleSearchGroups = (value: string) => {
    setSearchGroup(value);
    if (value.trim() === "") {
      setGroupChatRecords(groupChatList);
    } else {
      const filterList = groupChatList.filter((item: GroupChatRecord) =>
        item.name.toLowerCase().includes(value.toLowerCase()),
      );
      setGroupChatRecords(filterList);
    }
  };

  // Set the current group chat
  const handleSelectChat = (chat: GroupChatRecord) => {
    dispatch(setCurrentGroupChatListRecord(chat)); // Set the current chat
    setCurrentView("chatBoard"); // Switch to the chat board view on mobile
  };
  const handleBackToChatList = () => {
    setCurrentView("chatList");
  };

  // Fetch group chat data
  useEffect(() => {
    if (!groupChatList) {
      dispatch(getGroupChatData());
    } else {
      setGroupChatRecords(groupChatList);
      if (!currentGroupChatRecord && groupChatList.length > 0) {
        dispatch(setCurrentGroupChatListRecord(groupChatList[0]));
      }
    }
  }, [dispatch, groupChatList, currentGroupChatRecord]);

  // Handle screen resizing to detect mobile view
  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleResize = () => {
        const mobileView = window.innerWidth <= 1024;
        setIsMobileView(mobileView);
        if (mobileView) {
          setCurrentView("chatList");
        }
      };
      window.addEventListener("resize", handleResize);
      handleResize();
      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }
  }, []);

  return (
    <React.Fragment>
      <BreadCrumb title="Group Chat" subTitle="Chats" />
      <div className="grid grid-cols-12 gap-x-space">
        {isMobileView ? (
          currentView === "chatList" ? (
            <GroupChatList
              groupChatList={allGroupChatRecords}
              handleSearchGroups={handleSearchGroups}
              searchGroup={searchGroup}
              currentGroupChat={currentGroupChatRecord}
              openAddNewGroupModal={() => handleAddNewGroupModal(true)}
              onSelectChat={handleSelectChat}
            />
          ) : (
            <GroupChatBoard
              handleAudioCallModal={() =>
                handleOpenAudioCallModal(!isAudioCallModalOpen)
              }
              currentGroupChat={currentGroupChatRecord}
              handleDeleteGroupModal={() => setIsDeleteGroupModalOpen(true)}
              onBack={handleBackToChatList}
            />
          )
        ) : (
          <>
            <GroupChatList
              groupChatList={allGroupChatRecords}
              handleSearchGroups={handleSearchGroups}
              searchGroup={searchGroup}
              currentGroupChat={currentGroupChatRecord}
              openAddNewGroupModal={() => handleAddNewGroupModal(true)}
              onSelectChat={handleSelectChat}
            />

            {/* Group chat board */}
            <GroupChatBoard
              handleAudioCallModal={() =>
                handleOpenAudioCallModal(!isAudioCallModalOpen)
              }
              currentGroupChat={currentGroupChatRecord}
              handleDeleteGroupModal={() => setIsDeleteGroupModalOpen(true)}
              onBack={handleBackToChatList}
            />

            {/* Group info */}
            <GroupInfo currentChat={currentGroupChatRecord} />
          </>
        )}
      </div>

      {/* Add New Group Modal */}
      {isOpenAddNewGroupModal && (
        <AddNewGroupModal
          open={isOpenAddNewGroupModal}
          closeModal={() => setIsOpenAddNewGroupModal(false)}
          groupChatList={groupChatList}
        />
      )}

      {/* Delete Group Modal */}
      {isDeleteGroupModalOpen && (
        <DeleteGroupModal
          open={isDeleteGroupModalOpen}
          closeModal={() => setIsDeleteGroupModalOpen(false)}
          deleteGroupChatRecord={handleDeleteGroupModal}
        />
      )}
    </React.Fragment>
  );
};

export default Group;
