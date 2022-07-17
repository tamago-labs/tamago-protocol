import { createGlobalStyle } from "styled-components";
import { Routes, Route, Link } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import Faucet from "./components/faucet";
import CreateOrder from "./components/createOrder"
import Header from "./components/header"
import Home from "./components/home"
import Footer from "./components/footer"
import OrderDetails from "./components/orderDetails"

import "react-toastify/dist/ReactToastify.css";

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  body {
    font-family: monospace;
    color: white;
    /* Full height */
    min-height: 100vh; 

    /* Created with https://www.css-gradient.com */
    background: #2F1F26;
    background: -webkit-linear-gradient(top left, #2F1F26, #6E2A87);
    background: -moz-linear-gradient(top left, #2F1F26, #6E2A87);
    background: linear-gradient(to bottom right, #2F1F26, #6E2A87);
  }
`;

function App() {
  return (
    <div className="App">
      <GlobalStyle />
      <Header />
    
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/faucet" element={<Faucet />} />
        <Route path="/create" element={<CreateOrder />} />
        <Route path="/order/:id" element={<OrderDetails />} />
      </Routes>

      <Footer/>
    </div>
  );
}

export default App;
