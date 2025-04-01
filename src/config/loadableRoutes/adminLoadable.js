import loadable from '@loadable/component'

// Admin router
export const HomeAdminPage = loadable(() => import('../../pages/site-admin/pages/HomePage/AdminHomePage'));
export const LoginAdminPage = loadable(() => import('../../pages/site-admin/pages/LoginPage/AdminLoginPage'));
export const ProductAdminPage = loadable(() => import('../../pages/site-admin/pages/Products/ProductsAdminPage/ProductsAdminPage'));
export const ProductCreateAdminPage = loadable(() => import('../../pages/site-admin/pages/Products/ProductCreateAdminPage/ProductCreateAdminPage'));
export const ProductEditAdminPage = loadable(() => import('../../pages/site-admin/pages/Products/ProductEditAdminPage/ProductEditAdminPage'));

