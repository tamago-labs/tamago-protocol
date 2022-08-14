import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';
import { useWeb3React } from "@web3-react/core";
import { shortAddress } from "../../helper"
import Orders from "./orders"

const Wrapper = styled.div.attrs(() => ({ className: "container" }))`
  padding-top: 1rem;
`;

const Avatar = styled.div.attrs(() => ({
  className: "",
}))`
    margin-left: auto;
    margin-right: auto;
  `;


const Address = styled.div`
  margin-left: auto;
  margin-right: auto;
  font-size: 20px;
  margin-top: 0.5rem;
`;


const AvatarWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 2rem 1rem;
  border: 1px solid white;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  text-shadow: 1px 1px #333;

  position: relative;
  overflow: hidden;
  min-height: 225px;
  margin-bottom: 2rem;

  @media only screen and (max-width: 600px) {
    padding: 1rem 2rem;
  }
`;


const TabBody = styled.div`
  display: flex;
  flex-wrap: wrap; 
  padding-top: 1rem;
  padding-bottom: 1rem; 

`

// const AccountTab = styled(Tabs)`
//   .nav-link {
//     color: #fff;
//   }
// `;


const AccountPanel = styled.div`
  width: 100%;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  display: flex;
  flex-direction: row; 
  min-height: 400px;
`

const NavSide = styled.div`
  flex: 1;
  padding: 10px;
`

const NavItem = styled.div`
  border: 1px solid white;
  border-radius: 5px;
  padding: 20px 15px;

  a {
    cursor: pointer;
  }

`

const ContentSide = styled.div`
  flex: 3; 
  padding: 10px;
`

const Account = () => {

  const { account, chainId, deactivate } = useWeb3React();

  return (
    <Wrapper>

      {account && (
        <>
          <AccountPanel>

            <Tabs>
              <TabList>
                <Tab>
                  Your Orders
                </Tab> 
              </TabList>

              <TabPanel> 
                 <Orders/>
              </TabPanel>
            </Tabs>
 
          </AccountPanel>
        </>
      )}

      {!account && <>Wallet is not connected</>}

    </Wrapper>
  )
}

export default Account