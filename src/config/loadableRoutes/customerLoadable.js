import loadable from '@loadable/component'

// Customer router
export const HomePage = loadable(() => import('../../pages/site-customer/pages/HomePage/HomePage'));
export const LoginPage = loadable(() => import('../../pages/site-customer/pages/LoginPage/LoginPage'));
export const DetailPage = loadable(() => import('../../pages/site-customer/pages/DetailPage/DetailPage'));
export const CartPage = loadable(() => import('../../pages/site-customer/pages/CartPage/CartPage'));
export const SearchPage = loadable(() => import('../../pages/site-customer/pages/SearchPage/SearchPage'));
export const OrderHistoryPage = loadable(() => import('../../pages/site-customer/pages/OrderHistoryPage/OrderHistoryPage'));

export const ErrorPage = loadable(() => import('../../pages/site-customer/pages/ErrorPage/ErrorPage'));
