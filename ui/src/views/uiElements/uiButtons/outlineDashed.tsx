// src/OutlineDashedButtonCard.js
import Button from "@src/components/custom/buttons/button";
import React from "react";

const OutlineDashedButtonCard = () => {
  const outlineDashedButtons = [
    { text: "Primary", color: "btn-dashed-primary" },
    { text: "Purple", color: "btn-dashed-purple" },
    { text: "Green", color: "btn-dashed-green" },
    { text: "Red", color: "btn-dashed-red" },
    { text: "Yellow", color: "btn-dashed-yellow" },
    { text: "Sky", color: "btn-dashed-sky" },
    { text: "Pink", color: "btn-dashed-pink" },
    { text: "Indigo", color: "btn-dashed-indigo" },
    { text: "Orange", color: "btn-dashed-orange" },
    { text: "Dark", color: "btn-dashed-gray" },
    {
      text: "Light",
      color:
        "bg-transparent text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-gray-500 hover:border-gray-200 focus:bg-gray-50 focus:text-gray-500 focus:border-gray-200",
    },
  ];

  return (
    <React.Fragment>
      <div className="col-span-12 card">
        <div className="card-header">
          <h6 className="card-title">Outline Dashed Style</h6>
        </div>
        <div className="card-body">
          <div className="flex flex-wrap gap-4">
            {outlineDashedButtons.map((button, index) => (
              <Button
                key={index}
                className="btn btn-dashed  btn border-dashed"
                text={button.text}
                color={`btn-dashed ${button.color}`}
              />
            ))}
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default OutlineDashedButtonCard;
