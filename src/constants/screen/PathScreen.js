export const SCREEN_URL = {

  // Path Customer
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DETAILS: '/details/:urlPath/:productId',
  CATEGORY: '/product-category/:urlPath/:productCategory',
  CART: '/carts',
  SEARCH: '/search/:productSearch',
  ORDER_HISTORY: '/order-history',

  // ========================Path Admin======================

  ADMIN_HOME: '/admin',
  ADMIN_LOGIN: '/admin/login',

  // User 
  ADMIN_USERS: '/admin/users',
  ADMIN_CREATE_USER: '/admin/user/create',
  ADMIN_EDIT_USER: '/admin/users/:userId',

  // Product
  ADMIN_PRODUCT: '/admin/product',
  ADMIN_CREATE_PRODUCT: '/admin/product/create',
  ADMIN_EDIT_PRODUCT: '/admin/product/:productId',

  // Cart
  ADMIN_CARTS: '/admin/carts',
  ADMIN_CREATE_CART: '/admin/create-cart',
  ADMIN_EDIT_CART: '/admin/cart/:cartId',

  // Cart Items
  ADMIN_CART_ITEMS: '/admin/cart-items',
  ADMIN_CREATE_CART_ITEM: '/admin/create-cart-item',
  ADMIN_EDIT_CART_ITEM: '/admin/cart-item/:cartItemId',
};
