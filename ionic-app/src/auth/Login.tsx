import React, { useContext, useState } from 'react';
import { Redirect } from 'react-router-dom';
import { RouteComponentProps } from 'react-router';
import { IonButton, IonContent, IonHeader, IonInput, IonLoading, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { AuthContext } from './AuthProvider';
import { getLogger } from '../core';

const log = getLogger('Login');

interface LoginState {
    username?: string;
    password?: string;
}

export const Login: React.FC<RouteComponentProps> = ({ history }) => {
    const { isAuthenticated, isAuthenticating, login, authenticationError, pendingSignup } = useContext(AuthContext);
    const [state, setState] = useState<LoginState>({});
    const { username, password } = state;
    const handleLogin = () => {
        log('handleLogin...');
        login?.(username, password);
    };
    log('render');
    if (isAuthenticated) {
        return <Redirect to={{ pathname: '/' }} />
    }
    return (
        <IonPage>
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

                    <IonButton onClick={handleLogin}>Login</IonButton>
                    <IonButton onClick={()=> history.push("/signup")}>Signup</IonButton>
                </div>
                {authenticationError && (
                    <div>{authenticationError || 'Failed to authenticate'}</div>
                )}
            </IonContent>
        </IonPage>
    );
};
