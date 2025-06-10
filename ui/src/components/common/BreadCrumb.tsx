// import Head from 'next/head';
// import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface BreadcrumbItems {
  title?: string;
  subTitle: string;
}

const BreadCrumb = ({ title, subTitle }: BreadcrumbItems) => {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true); // Ensures that hydration is completed
  }, []);

  if (!hydrated) {
    return null; // Prevent render until hydrated
  }
  return (
    <React.Fragment>
      <div className="flex-col items-start gap-1 page-heading sm:flex-row sm:items-center">
        <h6 className="grow group-data-[nav-type=pattern]:text-white">
          {title}
        </h6>
        <ul className="breadcrumb *:before:content-['\EA6E']">
          <li className="breadcrumb-item">
            <Link to="#!">{subTitle}</Link>
          </li>
          <li className="breadcrumb-item active">{title}</li>
        </ul>
      </div>
    </React.Fragment>
  );
};

export default BreadCrumb;
