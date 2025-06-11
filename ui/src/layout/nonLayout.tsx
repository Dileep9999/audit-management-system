import React from "react";

interface NonLayoutProps {
  children: React.ReactNode;
  breadcrumbTitle?: string;
}

const NonLayout = ({ children, breadcrumbTitle }: NonLayoutProps) => {
  const title = breadcrumbTitle
    ? ` ${breadcrumbTitle} | Domiex - React TS Admin & Dashboard Template `
    : "Domiex - Admin & Dashboard Template";

  return (
    <React.Fragment>
      <title>{title}</title>
      <main>{children}</main>
    </React.Fragment>
  );
};

export default NonLayout;
