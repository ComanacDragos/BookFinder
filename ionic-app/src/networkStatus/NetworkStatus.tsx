import React, {useContext} from "react";
import {IonFab, IonIcon} from "@ionic/react";
import {wifi} from "ionicons/icons";
import {NetworkStatusContext} from "./NetworkStatusProvider";

const NetworkStatus: React.FC = () => {
    const { connected } = useContext(NetworkStatusContext);
    return (
        <IonFab vertical="top" horizontal="start" slot="fixed">
            <IonIcon size="large" icon={wifi} style={connected?{'color': 'green'}:{'color':'red'}}/>
        </IonFab>
    );
}

export default NetworkStatus;