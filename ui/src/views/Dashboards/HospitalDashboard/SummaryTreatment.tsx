import React from "react";
import user25 from "@assets/images/avatar/user-25.png";
import user26 from "@assets/images/avatar/user-26.png";
import user27 from "@assets/images/avatar/user-27.png";
import user28 from "@assets/images/avatar/user-28.png";
import user29 from "@assets/images/avatar/user-29.png";
import user30 from "@assets/images/avatar/user-30.png";
import { MoveLeft, MoveRight } from "lucide-react";
import { Link } from "react-router-dom";

const TreatmentData = [
  {
    image: user25,
    doctorname: "Dr. Mariana Grandon",
    degree: "Endocrinologist",
    Treatmentnumber: "2154",
    borderclass: "border-b border-r",
  },
  {
    image: user26,
    doctorname: "Dr. Sydney Toor",
    degree: "Hematology",
    Treatmentnumber: "879",
    borderclass: "border-b",
  },
  {
    image: user27,
    doctorname: "Dr. Dante Ditto",
    degree: "Radiologist",
    Treatmentnumber: "643",
    borderclass: "border-b border-r",
  },
  {
    image: user28,
    doctorname: "Dr. Marcus Welton",
    degree: "Nephrologist",
    Treatmentnumber: "5412",
    borderclass: " border-b",
  },
  {
    image: user29,
    doctorname: "Dr. Jennifer Maune",
    degree: "Cardiologist",
    Treatmentnumber: "1874",
    borderclass: "border-r",
  },
  {
    image: user30,
    doctorname: "Dr. Antonio Ligler",
    degree: "Neurologists",
    Treatmentnumber: "1195",
    borderclass: "",
  },
];

const SummaryTreatment = () => {
  return (
    <React.Fragment>
      <div className="col-span-12 lg:col-span-6 xl:col-span-4 card">
        <div className="flex items-center gap-3 card-header">
          <h6 className="card-title grow">Summary Treatment</h6>
          <Link
            to="#!"
            className="text-primary-500 link hover:text-primary-600"
          >
            See All
            <MoveRight className="ml-1 ltr:inline-block rtl:hidden size-4" />
            <MoveLeft className="mr-1 rtl:inline-block ltr:hidden size-4" />
          </Link>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-12">
            {TreatmentData.map((item, index) => {
              return (
                <div
                  key={index}
                  className={`col-span-6 p-4 ${item.borderclass} border-gray-200 border-dashed dark:border-dark-800`}
                >
                  <div className="flex gap-2">
                    <img
                      src={item.image}
                      alt="TreatmentDataIMg"
                      className="rounded-md size-10 shrink-0"
                    />
                    <div className="overflow-hidden grow">
                      <h6 className="truncate">{item.doctorname}</h6>
                      <p className="text-gray-500 dark:text-dark-500">
                        {item.degree}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-gray-500 dark:text-dark-500">
                    {item.Treatmentnumber} Treatment
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};
export default SummaryTreatment;
