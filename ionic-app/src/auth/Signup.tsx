import React, { useContext, useState } from 'react';
import { Redirect } from 'react-router-dom';
import { RouteComponentProps } from 'react-router';
import { IonButton, IonContent, IonHeader, IonInput, IonLoading, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { AuthContext } from './AuthProvider';
import { getLogger } from '../core';

const log = getLogger('Signup');

interface SignupState {
    username?: string;
    password?: string;
    confirmPassword? : string
}

export const Signup: React.FC<RouteComponentProps> = ({ history }) => {
    const { isAuthenticated, signupInProcess, signup, signupError } = useContext(AuthContext);
    const [state, setState] = useState<SignupState>({});
    const {username, password, confirmPassword} = state;
    const handleSignup = () =>{
        log('handle signup...')
        signup?.(username, password, confirmPassword)
    }
    log('render');
    if (isAuthenticated) {
        return <Redirect to={{ pathname: '/' }} />
    }
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Signup</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <div className="column">
                    <IonInput className="input"
                      placeholder="Username"
                      value={username}
                      onIonChange={e=>setState({
                          ...state,
                          username: e.detail.value || ''
                      })}
                        />
                    <IonInput className="input"
                              placeholder="Password"
                              type="password"
                              value={password}
                              onIonChange={e=>setState({
                                  ...state,
                                  password: e.detail.value || ''
                              })}
                        />
                    <IonInput className="input"
                              placeholder="Confirm Password"
                              type="password"
                              value={confirmPassword}
                              onIonChange={e=>setState({
                                  ...state,
                                  confirmPassword: e.detail.value || ''
                              })}
                    />
                    <IonLoading isOpen={signupInProcess}/>

                    <IonButton onClick={handleSignup}>Signup</IonButton>
                    <IonButton onClick={()=> history.push("/login")}>Back</IonButton>

                    {signupError && (
                        <div>{signupError || 'Failed to signup'}</div>
                    )}
                </div>

            </IonContent>
        </IonPage>
    );
}