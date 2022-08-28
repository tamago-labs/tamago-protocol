import React, {
    useEffect,
    useMemo,
    useReducer,
    createContext,
    useState,
    useCallback,
} from "react";
import { useWeb3React } from "@web3-react/core";
import axios from "axios";

export const AccountContext = createContext({});

const Provider = ({ children }) => {
    const [state, dispatch] = useReducer(
        (prevState, action) => {
            switch (action.type) {
                case "UPDATE_NETWORK":
                    const { isMainnet } = action.data;

                    return {
                        ...prevState,
                        isMainnet
                    };
                default:
                    return {
                        ...prevState,
                    };
            }
        },
        {
            isMainnet: true
        }
    );

    const { isMainnet } = state;

    const updateNetwork = (isMainnet) => {
        dispatch({
            type: "UPDATE_NETWORK",
            data: {
                isMainnet
            },
        });
    }

    const accountContext = useMemo(
        () => ({ 
            updateNetwork,
            isMainnet : process.env.NETWORK === "MAINNET" ? true : false
        }),
        [updateNetwork, isMainnet]
    );

    return (
        <AccountContext.Provider value={accountContext}>
            {children}
        </AccountContext.Provider>
    );
};

export default Provider;
