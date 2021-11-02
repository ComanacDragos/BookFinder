import React, {useContext, useEffect, useState} from 'react';
import { Redirect } from 'react-router-dom';
import { RouteComponentProps } from 'react-router';
import {
    IonButton,
    IonContent,
    IonHeader,
    IonInput,
    IonLoading,
    IonPage,
    IonTitle,
    IonToolbar,
    IonFab
} from '@ionic/react';
import { AuthContext } from './AuthProvider';
import { getLogger } from '../core';
import {NetworkStatus} from "../networkStatus";
import { createAnimation } from '@ionic/react';

const log = getLogger('Login');

interface LoginState {
    username?: string;
    password?: string;
}

export const Login: React.FC<RouteComponentProps> = ({ history }) => {
    const { isAuthenticated, isAuthenticating, login, authenticationError, clearError, token } = useContext(AuthContext);
    const [state, setState] = useState<LoginState>({});
    const { username, password } = state;

    const handleLogin = () => {
        log('handleLogin...');
        login?.(username, password);
    };
    log('render');
    useEffect(animateLoginButton, [])

    if (isAuthenticated) {
        return <Redirect to={{ pathname: '/' }} />
    }
    return (
        <IonPage>
            <NetworkStatus/>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Login</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <div className="column">
                    <IonInput class="input"
                        placeholder="Username"
                        value={username}
                        onIonChange={e => setState({
                            ...state,
                            username: e.detail.value || ''
                        })}/>
                    <IonInput class="input"
                        placeholder="Password"
                        type="password"
                        value={password}
                        onIonChange={e => setState({
                            ...state,
                            password: e.detail.value || ''
                        })}/>
                    <IonLoading isOpen={isAuthenticating}/>

                    <IonButton id="loginButton" onClick={handleLogin}>Login</IonButton>
                    <IonButton id="signupButton" onClick={()=> clearError(()=> history.push("/signup"))}>Signup</IonButton>
                </div>
                {authenticationError && (
                    <div>{authenticationError || 'Failed to authenticate'}</div>
                )}
            </IonContent>
        </IonPage>
    );

    function animateLoginButton(){
        const el = document.querySelector('#loginButton');
        if (el) {
            const animation = createAnimation()
                .addElement(el)
                .duration(500)
                .direction('alternate')
                .iterations(Infinity)
                .keyframes([
                    { offset: 0, opacity: '1' },
                    {
                        offset: 1, opacity: '0.5'
                    },
                ]);
            animation.play();
        }
    }
};
