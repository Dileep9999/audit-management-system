import {
  ContactChatRecord,
  NextPageWithLayout,
  UserChatRecord,
} from "@src/dtos";
import { AppDispatch, RootState } from "@src/slices/reducer";
import {
  getDefaultChatData,
  setCurrentChatListRecord,
} from "@src/slices/thunk";
import { getContactChatData } from "@src/slices/chat/contact/thunk";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { defaultContactChat } from "@src/data";
import BreadCrumb from "@src/components/common/breadCrumb";
import CompanyMenu from "@src/views/apps/chat/default/companyMenu";
import UserChatList from "@src/views/apps/chat/default/userChatList";
import UserChatBoard from "@src/views/apps/chat/default/userChatBoard";
import UserAudioCallModal from "@src/views/apps/chat/default/userAudioCallModal";
import UserVideoCallModal from "@src/views/apps/chat/default/userVideoCallModal";
import AddNewContactModal from "@src/views/apps/chat/default/addNewContactModal";

const DefaultChat: NextPageWithLayout = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { defaultChatList, currentContactChat } = useSelector(
    (state: RootState) => state.DefaultChat,
  );
  const { contactList } = useSelector((state: RootState) => state.ContactChat);
  const [chatContactList, setChatContactList] = useState<UserChatRecord[]>([]);
  const [userFriendList, setUserFriendList] = useState<ContactChatRecord[]>([]);
  const [searchContact, setSearchContact] = React.useState<string>("");
  const [searchUserFriend, setSearchUserFriend] = React.useState<string>("");
  const [isAudioCallModalOpen, setIsAudioCallModalOpen] =
    useState<boolean>(false);
  const [isVideoCallModalOpen, setIsVideoCallModalOpen] =
    useState<boolean>(false);
  const [isAddContactModalOpen, setIsAddContactModalOpen] =
    useState<boolean>(false);
  const [defaultChatData, setDefaultChatData] = useState<UserChatRecord>(
    {} as UserChatRecord,
  );
  const [isMobileView, setIsMobileView] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<"chatList" | "chatBoard">(
    "chatList",
  );

  useEffect(() => {
    document.title =
      "Default Chat | Domiex - React TS Admin & Dashboard Template";
  }, []);

  // Search contacts
  const handleSearchContacts = (value: string) => {
    setSearchContact(value);
    if (value.trim() === "") {
      setChatContactList(defaultChatList);
    } else {
      const filterList = defaultChatList.filter((item: UserChatRecord) =>
        item.name.toLowerCase().includes(value.toLowerCase()),
      );
      setChatContactList(filterList);
    }
  };

  // search user friend list
  const handleSearchUserFriendList = (value: string) => {
    setSearchUserFriend(value);
    if (value.trim() === "") {
      setUserFriendList(contactList);
    } else {
      const filterFriendList = contactList.filter((item: UserChatRecord) =>
        item.name.toLowerCase().includes(value.toLowerCase()),
      );
      setUserFriendList(filterFriendList);
    }
  };

  // open audio call modal
  const handleOpenAudioCallModal = (value: boolean) => {
    setIsAudioCallModalOpen(value);
  };

  // open video call modal
  const handleOpenVideoCallModal = (value: boolean) => {
    setIsVideoCallModalOpen(value);
  };

  const handleBackToChatList = () => {
    setCurrentView("chatList");
  };

  const handleSelectChat = (chat: UserChatRecord) => {
    dispatch(setCurrentChatListRecord(chat));
    setCurrentView("chatBoard");
  };

  // handle audio video call
  const handleAudioVideoCall = () => {
    handleOpenAudioCallModal(false);
    handleOpenVideoCallModal(true);
  };

  // handle add new contact
  const handleAddNewContact = (value: boolean) => {
    setIsAddContactModalOpen(value);
  };

  // get default chat list
  useEffect(() => {
    if (!defaultChatList) {
      dispatch(getDefaultChatData());
    } else {
      setChatContactList(defaultChatList);
      if (!currentContactChat && defaultChatList.length > 0) {
        dispatch(setCurrentChatListRecord(defaultChatList[0]));
      }
    }
  }, [dispatch, defaultChatList, currentContactChat]);

  // get user friend list
  useEffect(() => {
    if (!contactList) {
      dispatch(getContactChatData());
    } else {
      setUserFriendList(contactList);
    }
  }, [contactList, dispatch]);

  useEffect(() => {
    if (defaultContactChat) {
      setDefaultChatData(defaultContactChat);
    }
  }, []);

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
      <BreadCrumb title="Default Chat" subTitle="Chats" />
      <div className="grid grid-cols-12 gap-x-space">
        {/* company menu */}
        <CompanyMenu />

        {isMobileView ? (
          currentView == "chatList" ? (
            <UserChatList
              chatMessageList={chatContactList}
              searchValue={searchContact}
              searchContact={(val: string) => handleSearchContacts(val)}
              handleAddNewContact={() => handleAddNewContact(true)}
              currentChat={currentContactChat}
              onSelectChat={handleSelectChat}
            />
          ) : (
            <UserChatBoard
              currentChat={currentContactChat}
              handleAudioCallModal={() => handleOpenAudioCallModal(true)}
              handleVideoCallModal={() => handleOpenVideoCallModal(true)}
              contactList={userFriendList}
              onBack={handleBackToChatList}
            />
          )
        ) : (
          <>
            <UserChatList
              chatMessageList={chatContactList}
              searchValue={searchContact}
              searchContact={(val: string) => handleSearchContacts(val)}
              handleAddNewContact={() => handleAddNewContact(true)}
              currentChat={currentContactChat}
              onSelectChat={handleSelectChat}
            />
            <UserChatBoard
              currentChat={currentContactChat}
              handleAudioCallModal={() => handleOpenAudioCallModal(true)}
              handleVideoCallModal={() => handleOpenVideoCallModal(true)}
              contactList={userFriendList}
              onBack={handleBackToChatList}
            />
          </>
        )}
      </div>

      {/* audio call modal */}
      {isAudioCallModalOpen && (
        <UserAudioCallModal
          open={isAudioCallModalOpen}
          closeModal={() => handleOpenAudioCallModal(false)}
          currentContact={currentContactChat}
          handleAudioVideoCall={handleAudioVideoCall}
        />
      )}

      {/* video call modal */}
      {isVideoCallModalOpen && (
        <UserVideoCallModal
          open={isVideoCallModalOpen}
          closeModal={() => handleOpenVideoCallModal(false)}
          currentContact={currentContactChat}
        />
      )}

      {/* add contact modal */}
      {isAddContactModalOpen && (
        <AddNewContactModal
          open={isAddContactModalOpen}
          closeModal={() => handleAddNewContact(false)}
          friendList={userFriendList}
          searchFriend={searchUserFriend}
          handleSearch={(val: string) => handleSearchUserFriendList(val)}
          contactList={chatContactList}
          defaultChat={defaultChatData}
        />
      )}
    </React.Fragment>
  );
};

export default DefaultChat;
