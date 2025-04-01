import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import { useSelector } from 'react-redux';
const LayoutContainer = ({ component: Component, isHeader, isFooter, title }) => {
  document.title = 'Shop Công Nghệ - ' + title;
  const { isLoggedIn, current } = useSelector((state) => state.user);
  console.log(current);

  return (
    <>
      {isHeader && <Header />}
      <Component />
      {isFooter && <Footer />}
    </>
  );
};

export default LayoutContainer;
