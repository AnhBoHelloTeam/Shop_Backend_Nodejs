import { ToastContainer } from "react-toastify";
import "./App.css";
import RouterComponent from './router/Router';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <div>
      <RouterComponent /><ToastContainer />
    </div>
  );
}

export default App;
