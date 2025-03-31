import { SCREEN_URL } from '../../constants/screen/PathScreen';
import { CartPage, CategoriesPage, CheckoutPage, DetailPage, HomePage, LoginPage, OrderHistoryPage, PaymentFailPage, PaymentSuccessFail, PaymentSuccessPage, RegisterPage, SearchPage } from '../loadableRoutes/customerLoadable';

// Config layout customer
export const layoutCustomer = [
  {
    path: SCREEN_URL.HOME,
    component: HomePage,
    isHeader: true,
    isFooter: true,
    title: 'Trang chủ',
  },
  {
    path: SCREEN_URL.LOGIN,
    component: LoginPage,
    isHeader: false,
    isFooter: false,
    title: 'Đăng nhập',
  },

  {
    path: SCREEN_URL.DETAILS,
    component: DetailPage,
    isHeader: true,
    isFooter: true,
    title: 'Chi tiết',
  },
  {
    path: SCREEN_URL.CART,
    component: CartPage,
    isHeader: true,
    isFooter: true,
    title: 'Giỏ hàng',
  },
  {
    path: SCREEN_URL.SEARCH,
    component: SearchPage,
    isHeader: true,
    isFooter: true,
    title: 'Tìm kiếm sản phẩm',
  },
  {
    path: SCREEN_URL.ORDER_HISTORY,
    component: OrderHistoryPage,
    isHeader: true,
    isFooter: true,
    title: 'Lịch sử mua hàng',
  },
];
