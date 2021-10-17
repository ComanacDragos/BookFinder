import React from "react";
import {IonFab, IonIcon} from "@ionic/react";
import {wifi} from "ionicons/icons";
import {useNetwork} from "./useNetwork";

const NetworkStatus: React.FC = () => {
    const { networkStatus } = useNetwork();
    return (
        <IonFab vertical="top" horizontal="start" slot="fixed">
            <IonIcon size="large" icon={wifi} style={networkStatus.connected?{'color': 'green'}:{'color':'red'}}/>
        </IonFab>
    );
}

export default NetworkStatus;