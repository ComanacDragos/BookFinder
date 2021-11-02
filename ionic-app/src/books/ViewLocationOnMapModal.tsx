import React, { useState } from 'react';
import { createAnimation, IonModal, IonButton, IonContent } from '@ionic/react';
import {MyMap} from "../maps/MyMap";
import {BookPosition} from "./BookProps";

export const ViewLocationOnMapModal: React.FC<BookPosition> = (props) => {
    const [showModal, setShowModal] = useState(false);

    const enterAnimation = (baseEl: any) => {
        const backdropAnimation = createAnimation()
            .addElement(baseEl.querySelector('ion-backdrop')!)
            .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');

        const wrapperAnimation = createAnimation()
            .addElement(baseEl.querySelector('.modal-wrapper')!)
            .keyframes([
                { offset: 0, opacity: '0', transform: 'scale(0)' },
                { offset: 1, opacity: '0.99', transform: 'scale(1)' }
            ]);

        return createAnimation()
            .addElement(baseEl)
            .easing('ease-out')
            .duration(500)
            .addAnimation([backdropAnimation, wrapperAnimation]);
    }

    const leaveAnimation = (baseEl: any) => {
        return enterAnimation(baseEl).direction('reverse');
    }

    return (
        <>
            <IonModal isOpen={showModal} enterAnimation={enterAnimation} leaveAnimation={leaveAnimation}>
                <MyMap
                    lat={props.lat}
                    lng={props.lng}
                    onMapClick={()=>{}}
                    onMarkerClick={()=>{}}
                />
                <IonButton onClick={() => setShowModal(false)}>Close map</IonButton>
            </IonModal>
            <IonButton onClick={() => setShowModal(true)}>Show position on map</IonButton>
        </>
    );
};
