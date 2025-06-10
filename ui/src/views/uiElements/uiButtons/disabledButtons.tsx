import Button from "@src/components/custom/buttons/button";
import React from "react";

const DisabledButtons = () => {
  return (
    <React.Fragment>
      <div className="col-span-12 xl:col-span-6 card">
        <div className="card-header">
          <h6 className="card-title">Disabled Buttons</h6>
        </div>
        <div className="card-body">
          <div className="flex flex-wrap gap-4">
            <Button
              text="Disabled"
              className="btn"
              color={`btn-primary`}
              disabled={true}
            />
            <Button
              text="Disabled"
              className="btn"
              color={`btn-sub-primary`}
              disabled={true}
            />
            <Button
              text="Disabled"
              className="btn"
              color={`btn-outline-primary`}
              disabled={true}
            />
            <Button
              text="Disabled"
              custom="border-dashed btn"
              className="btn"
              color={`btn-dashed-primary`}
              disabled={true}
            />
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};
export default DisabledButtons;
