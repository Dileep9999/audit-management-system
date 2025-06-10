import BreadCrumb from "@src/components/common/breadCrumb";
import { NextPageWithLayout } from "@dtos/layout";
import DateMask from "@views/uiAdvanced/uiAdvancedMask/dateMask";
import DynamicMasks from "@views/uiAdvanced/uiAdvancedMask/dynamicMasks";
import MoneyInputs from "@views/uiAdvanced/uiAdvancedMask/moneyInputs";
import PhoneNumberMasks from "@views/uiAdvanced/uiAdvancedMask/phoneNumberMasks";
import PinCodeMasks from "@views/uiAdvanced/uiAdvancedMask/pinCodeMasks";
import React, { useEffect } from "react";

const Mask: NextPageWithLayout = () => {
  useEffect(() => {
    document.title =
      "Mask Input | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      <BreadCrumb title="Mask Input" subTitle="UI Advanced" />
      <div className="grid grid-cols-12 gap-x-space">
        <DateMask />
        <DynamicMasks />
        <PinCodeMasks />
        <PhoneNumberMasks />
        <MoneyInputs />
      </div>
    </React.Fragment>
  );
};

export default Mask;
