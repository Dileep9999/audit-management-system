import BreadCrumb from "@src/components/common/breadCrumb";
import { NextPageWithLayout } from "@dtos/layout";
import WordCounter from "@views/uiAdvanced/uiAdvancedWordCounter/wordCounter";
import React, { useEffect } from "react";

const WordCounters: NextPageWithLayout = () => {
  useEffect(() => {
    document.title =
      "Word Counter | Domiex - React TS Admin & Dashboard Template";
  }, []);

  return (
    <React.Fragment>
      <BreadCrumb title="Word Counter" subTitle="UI Advanced" />
      <WordCounter />
    </React.Fragment>
  );
};

export default WordCounters;
