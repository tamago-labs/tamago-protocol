import React, { useState, useEffect, useCallback, useContext, useId } from "react"
import { useWeb3React } from "@web3-react/core"
import styled from "styled-components"
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';
import { X, Check, ArrowRight } from "react-feather"
import { Puff } from 'react-loading-icons'
import BaseModal from "./baseModal"
import { Button } from "../button"



const AccountPanel = styled.div`
  width: 100%;
  min-height: 400px;
`

const AccountModal = ({
    loading,
    visible,
    toggle
}) => {

    const { account, chainId, deactivate } = useWeb3React();

    return (
        <>
            <BaseModal
                isOpen={visible}
                onRequestClose={toggle}
                title={"Account"}
                width={"900px"}
            >
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
                                    {/* <Orders /> */}
                                </TabPanel>
                            </Tabs>

                        </AccountPanel>
                    </>
                )}

                {!account && <>Wallet is not connected</>}
            </BaseModal>
        </>
    )
}

export default AccountModal