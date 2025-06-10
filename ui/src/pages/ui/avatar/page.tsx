import BreadCrumb from "@src/components/common/breadCrumb";
import BasicAvatar from "@src/views/uiElements/UiAvatar/BasicAvatar";
import ColoredAvatar from "@src/views/uiElements/UiAvatar/ColoredAvatar";
import GroupAvatar from "@src/views/uiElements/UiAvatar/GroupAvatar";
import IconAvatar from "@src/views/uiElements/UiAvatar/IconAvatar";
import RoundedAvatar from "@src/views/uiElements/UiAvatar/RoundedAvatar";
import RoundedTextAvatar from "@src/views/uiElements/UiAvatar/RoundedTextAvatar";
import TextAvatar from "@src/views/uiElements/UiAvatar/TextAvatar";
import React, { useEffect } from "react";

const Avatar = () => {
  useEffect(() => {
    document.title = "Avatar | Domiex - React TS Admin & Dashboard Template";
  }, []);
  return (
    <React.Fragment>
      <BreadCrumb title="Avatar" subTitle="UI" />
      <div className="grid grid-cols-12 gap-x-space">
        <BasicAvatar />
        <RoundedAvatar />
        <RoundedTextAvatar />
        <TextAvatar />
        <IconAvatar />
        <RoundedTextAvatar />
        <ColoredAvatar />
        <GroupAvatar />
      </div>
    </React.Fragment>
  );
};

export default Avatar;
