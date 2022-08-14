import React, { FunctionComponent, useState } from "react"
import Modal from "react-modal"
import styled from "styled-components"
import { X } from "react-feather"

interface IBaseModal {
    children: React.ReactNode
    isOpen: boolean
    onRequestClose: () => void
    title?: string
    width?: string
}

const customStyles = {
    content: {
        top: '20%',
        height: "400px",
        width: "100%",
        maxWidth: "600px",
        marginLeft: "auto",
        marginRight: "auto",
        background: "#20283E",
        borderRadius: "8px",
        border: "1px solid white"
    },
};


const ModalStyle = styled.div<any>`
    margin-top: 100px;
    min-height: 200px;
    width: 100%;
    max-width: ${props => props.width && props.width };
    margin-left: auto;
    margin-right: auto;
    background: #20283E;
    border-radius: 8px;
    border: 1px solid white;
    padding: 20px; 
    z-index: 100;
`;

const ModalBody = styled.div`
    padding-top: 10px;
    color: white;
    z-index: 101;
`

const ModalHeader = styled.div`
    font-size: 20px; 
    display: flex;
    flex-direction: row;
    div {
        flex: 1;
        a {
            cursor: pointer;
        }
    }
`

const OverlayStyle = styled.div`
    z-index: 100;
`;

const BaseModal: FunctionComponent<IBaseModal> = ({
    children,
    isOpen,
    onRequestClose,
    title,
    width = "600px"
}) => {

    let subtitle: any

    function afterOpenModal() {
        // references are now sync'd and can be accessed.
        subtitle.style.color = '#f00';
    }

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            // style={customStyles}  
            className="_" 
            contentElement={(props, children) => <ModalStyle width={width} {...props}>{children}</ModalStyle>}
            overlayElement={(props, contentElement) => <OverlayStyle {...props}>{contentElement}</OverlayStyle>}
        >
            <ModalHeader>
                <div>
                    {title}
                </div>
                <div style={{ textAlign: "right" }}>
                    <a onClick={onRequestClose}>
                        <X />
                    </a>
                </div>
            </ModalHeader>
            <hr />
            <ModalBody>
                {children}
            </ModalBody>
        </Modal>
    )
}

export default BaseModal