import Header from '../Header/Header';
import Footer from '../Footer/Footer';
const LayoutContainer = ({ component: Component, isHeader, isFooter, title }) => {
  document.title = 'Shop Công Nghệ - ' + title;
  return (
    <>
      {isHeader && <Header />}
      <Component />
      {isFooter && <Footer />}
    </>
  );
};

export default LayoutContainer;
