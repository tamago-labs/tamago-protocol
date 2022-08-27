import React, { useState, useEffect, useCallback, useContext, useId } from "react"
import { useWeb3React } from "@web3-react/core"
import styled from "styled-components"
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';
import { X, Check, ArrowRight } from "react-feather"
import { Puff } from 'react-loading-icons'
import BaseModal from "./baseModal"
import { Button } from "../button"

const CollectionPanel = styled.div`
  width: 100%;
  height: 60vh;
  overflow-y: auto;
`

const CollectionModal = ({
    loading,
    visible,
    toggle,
    collectionName,
    total,
    children
}) => {

    return (
        <>
            <BaseModal
                isOpen={visible}
                onRequestClose={toggle}
                title={`${collectionName} (${total})`}
                width={"900px"}
            >
                <CollectionPanel>
                    {children}
                </CollectionPanel>
            </BaseModal>
        </>
    )
}

export default CollectionModal