import React, {useEffect, useState} from "react";
import PropTypes from "prop-types";
import {Network, NetworkStatus} from "@capacitor/network";



export interface NetworkStatusState{
    connected: boolean;
    connectionType: string;
}

const initialState = {
    connected: false,
    connectionType: 'unknown',
}

export const NetworkStatusContext = React.createContext<NetworkStatusState>(initialState);

interface NetworkProviderProps {
    children: PropTypes.ReactNodeLike,
}

export const NetworkStatusProvider: React.FC<NetworkProviderProps> = ({ children }) => {
    const [networkStatus, setNetworkStatus] = useState(initialState)
    useEffect(() => {
        const handler = Network.addListener('networkStatusChange', handleNetworkStatusChange);
        Network.getStatus().then(handleNetworkStatusChange);
        let canceled = false;
        return () => {
            canceled = true;
            handler.remove();
        }

        function handleNetworkStatusChange(status: NetworkStatus) {
            console.log('useNetwork - status change', status);
            if (!canceled) {
                setNetworkStatus(status);
            }
        }
    }, [])

    return (
        <NetworkStatusContext.Provider value={networkStatus}>
            {children}
        </NetworkStatusContext.Provider>
    );
}