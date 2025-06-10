import React from "react";
import { Route, Routes } from "react-router-dom";
import { nonAuthRoutes, routes } from "./allRoutes";
import NonLayout from "@src/layout/nonLayout";
import Layout from "@src/layout/layout";

const Routing = () => {
  return (
    <React.Fragment>
      <Routes>
        {(routes || []).map((item, key) => (
          <Route
            key={key}
            path={item.path}
            element={<Layout>{item.component}</Layout>}
          />
        ))}

        {(nonAuthRoutes || []).map((item, key) => (
          <Route
            key={key}
            path={item.path}
            element={<NonLayout>{item.component}</NonLayout>}
          />
        ))}
      </Routes>
    </React.Fragment>
  );
};

export default Routing;
