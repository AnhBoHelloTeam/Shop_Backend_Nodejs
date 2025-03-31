import React from 'react';
import { Route, Routes, useSubmit, useLocation } from 'react-router-dom';
import { layoutCustomer } from '../config/routeConfig/customerRoute';
import { layoutAdmin } from '../config/routeConfig/adminRoute';
import LayoutContainer from '../pages/site-customer/components/organisms/LayoutContainer/LayoutContainer';
import LayoutAdminContainer from '../pages/site-admin/components/organisms/LayoutAdminContainer/LayoutAdminContainer';
import { ErrorPage } from '../config/loadableRoutes/customerLoadable';

const RouterComponent = () => {
  return (
    <Routes>
      <Route path="/">
        {layoutCustomer.map(({ path, component, isHeader, isFooter, title }) => (
          <Route
            key={title}
            path={path}
            element={<LayoutContainer component={component} isHeader={isHeader} isFooter={isFooter} title={title} />}
          />
        ))}
      </Route>

      <Route path="/admin">
        {layoutAdmin.map(({ path, component, isHeader, isSidebar, title }) => (
          <Route
            key={title}
            path={path}
            element={
              <LayoutAdminContainer component={component} isHeader={isHeader} isSidebar={isSidebar} title={title} />
            }
          />
        ))}
      </Route>

      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
};

export default RouterComponent;
