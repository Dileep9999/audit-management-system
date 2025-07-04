import Button from "@src/components/custom/buttons/button";
import React from "react";

const SizeButton = () => {
  return (
    <React.Fragment>
      <div className="col-span-12 card">
        <div className="card-header">
          <h6 className="card-title">Button Size</h6>
        </div>
        <div className="card-body">
          <div className="flex flex-wrap items-center gap-4">
            <Button
              text="Extra Small"
              className="btn"
              color={`btn-primary`}
              size="btn-xs"
            />
            <Button
              text="Small"
              className="btn"
              color={`btn-primary`}
              size="btn-sm"
            />
            <Button
              text=" Medium"
              className="btn"
              color={`btn-primary`}
              size="btn-md"
            />
            <Button text="Default" custome="btn" color={`btn-primary`} />
            <Button
              text="Large"
              className="btn"
              color={`btn-primary`}
              size="btn-lg"
            />
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};
export default SizeButton;
