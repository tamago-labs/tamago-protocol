import React from 'react';
import ReactDOM from 'react-dom/client';
import { Web3ReactProvider } from "@web3-react/core"
import { BrowserRouter } from "react-router-dom"
import { MoralisProvider } from "react-moralis";
import "bootstrap/dist/css/bootstrap.min.css"
import "react-loading-skeleton/dist/skeleton.css"
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import './index.css';
import App from './App';
import { ethers } from "ethers";
import reportWebVitals from './reportWebVitals';
import { SkeletonTheme } from "react-loading-skeleton"

import { MORALIS_ID, MORALIS_URL } from './constants';

const getLibrary = (provider) => {
  const library = new ethers.providers.Web3Provider(provider)
  library.pollingInterval = 12000
  return library
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Web3ReactProvider getLibrary={getLibrary}>
        <MoralisProvider serverUrl={MORALIS_URL} appId={MORALIS_ID}>
          <SkeletonTheme highlightColor="#ccc">
            <App />
          </SkeletonTheme>
        </MoralisProvider>
      </Web3ReactProvider>
    </BrowserRouter>

  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
