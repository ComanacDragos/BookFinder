import React, {useCallback, useContext, useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import { getLogger } from '../core';
import { signup as signupApi, login as loginApi } from './authApi';
import {LocationState} from "@ionic/react-router/dist/types/ReactRouter/IonRouter";
import {getToken, removeToken, setToken} from "../storage";
import {remove} from "ionicons/icons";
import {NetworkStatusContext} from "../networkStatus/NetworkStatusProvider";

const log = getLogger('AuthProvider');

type LoginFn = (username?: string, password?: string) => void;
type LogoutFn = ()=> void;
type SignupFn = (username?: string, password?: string, confirmPassword?: string) => void;
type ClearErrorFn = (callback:()=>void)=>void;

export interface AuthState {
    authenticationError: Error | null | string;
    signupError: Error | null | string;
    isAuthenticated: boolean;
    isAuthenticating: boolean;
    signupInProcess: boolean;
    login?: LoginFn;
    logout?: LogoutFn;
    signup?: SignupFn;
    clearError: ClearErrorFn;
    pendingAuthentication?: boolean;
    pendingSignup?: boolean;
    username?: string;
    password?: string;
    confirmPassword?: string;
    token: string;
}

const initialState: AuthState = {
    isAuthenticated: false,
    isAuthenticating: false,
    signupInProcess: false,
    authenticationError: null,
    signupError: null,
    pendingAuthentication: false,
    pendingSignup: false,
    token: '',
    username: '',
    password: '',
    confirmPassword: '',
    clearError: ()=>{}
};

export const AuthContext = React.createContext<AuthState>(initialState);

interface AuthProviderProps {
    children: PropTypes.ReactNodeLike,
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [state, setState] = useState<AuthState>(initialState);
    const { isAuthenticated, isAuthenticating, signupInProcess, authenticationError, signupError, pendingAuthentication, pendingSignup, token } = state;
    const login = useCallback<LoginFn>(loginCallback, []);
    const logout = useCallback<LogoutFn>(logoutCallback, []);
    const signup = useCallback<SignupFn>(signupCallback, [])
    const clearError = useCallback<ClearErrorFn>(clearErrorsCallback, []);

    const {connected} = useContext(NetworkStatusContext);

    useEffect(authenticationEffect, [pendingAuthentication]);
    useEffect(signupEffect, [pendingSignup]);
    useEffect(isLoggedInEffect, [])

    const value = { isAuthenticated, login, logout, signup, clearError, isAuthenticating, signupInProcess, pendingSignup, authenticationError, signupError, token };
    log('render');
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );

    function isLoggedInEffect(){
        let canceled = false;
        isLoggedIn();
        return () => {
            canceled = true;
        }

        async function isLoggedIn(){
            const storageToken = await getToken();
            if(canceled)
                return
            if(storageToken!=='' && token === '')
                setState({...state,
                        token: storageToken,
                        isAuthenticated: true
                    }
                )
        }
    }

    function clearErrorsCallback(callback: ()=>void){
        log('clear errors')
        setState({...state, authenticationError: null, signupError: null})
        callback()
    }

    function signupCallback(username?: string, password?: string, confirmPassword?: string){
        log('signup')
        setState({
            ...state,
            signupInProcess: false,
            isAuthenticated: false,
            signupError: null,
            pendingSignup: true,
            token: '',
            username,
            password,
            confirmPassword
        });
    }

    function signupEffect(){
        let canceled = false;
        signup();
        return () => {
            canceled = true;
        }

        async function signup(){
            if (!pendingSignup) {
                log('signup, !pendingSignup, return');

                return;
            }
            if(!connected){
                log('not connected')
                setState({
                    ...state,
                    signupError: 'No connection',
                    pendingSignup: false
                })
                return
            }
            try {
                log('signup')
                setState({
                    ...state,
                    signupInProcess: true,
                });
                console.log(state)
                const { username, password, confirmPassword } = state;
                const { token } = await signupApi(username, password, confirmPassword);
                if (canceled) {
                    return;
                }
                setToken(token);
                log('signup succeeded');
                setState({
                    ...state,
                    token,
                    pendingSignup: false,
                    isAuthenticated: true,
                    signupInProcess: false,
                });
            } catch (error: any) {
                if (canceled) {
                    return;
                }
                log('signup failed');
                setState({
                    ...state,
                    signupError: error,
                    pendingSignup: false,
                    signupInProcess: false,
                });
            }
        }
    }

    function logoutCallback(){
        log('logout')
        removeToken();
        setState({
            ...state,
            isAuthenticated: false,
            isAuthenticating: false,
            authenticationError: null,
            pendingAuthentication: false,
            token: '',
        });
    }

    function loginCallback(username?: string, password?: string): void {
        log('login');
        setState({
            ...state,
            pendingAuthentication: true,
            username,
            password
        });
    }

    function authenticationEffect() {
        let canceled = false;
        authenticate();
        return () => {
            canceled = true;
        }

        async function authenticate() {
            if (!pendingAuthentication) {
                log('authenticate, !pendingAuthentication, return');
                return;
            }
            if(!connected){
                log('not connected')
                setState({
                    ...state,
                    authenticationError: 'No connection',
                    pendingAuthentication: false
                })
                return
            }
            try {
                log('authenticate...');
                setState({
                    ...state,
                    isAuthenticating: true,
                });
                const { username, password } = state;
                const { token } = await loginApi(username, password);
                if (canceled) {
                    return;
                }
                setToken(token);
                log('authenticate succeeded');
                setState({
                    ...state,
                    token,
                    pendingAuthentication: false,
                    isAuthenticated: true,
                    isAuthenticating: false,
                });
            } catch (error: any) {
                if (canceled) {
                    return;
                }
                log('authenticate failed');
                setState({
                    ...state,
                    authenticationError: error,
                    pendingAuthentication: false,
                    isAuthenticating: false,
                });
            }
        }
    }
};
