import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import {BookEdit, BookList} from "./books";
import {BookProvider} from "./books/BookProvider";
import {AuthProvider, Login, Signup, PrivateRoute} from "./auth";
import {NetworkStatusProvider} from "./networkStatus/NetworkStatusProvider";
import LibrarySearch from "./books/LibrarySearch";

const App: React.FC = () => (
    <IonApp>
        <IonReactRouter>
            <IonRouterOutlet>
                <NetworkStatusProvider>
                <AuthProvider>
                    <Route path="/login" component={Login} exact={true}/>
                    <Route path="/signup" component={Signup} exact={true}/>
                    <BookProvider>
                        <PrivateRoute path="/books" component={BookList} exact={true}/>
                        <PrivateRoute path="/book" component={BookEdit} exact={true}/>
                        <PrivateRoute path="/book/:id" component={BookEdit} exact={true}/>
                        <PrivateRoute path="/libraries" component={LibrarySearch} exact={true}/>

                    </BookProvider>
                    <Route exact path="/" render={() => <Redirect to="/books"/>}/>
                </AuthProvider>
                </NetworkStatusProvider>
            </IonRouterOutlet>
        </IonReactRouter>
    </IonApp>
);

export default App;
