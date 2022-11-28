import React, {Suspense} from "react";
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
} from "react-router-dom";
// import Auth from "./user/pages/Auth";
import { useState, useCallback, useEffect } from "react";
// import Users from "./user/pages/Users";
// import NewPlace from "./places/pages/NewPlace";
import MainNavigation from "./shared/components/Navigation/MainNavigation";
// import UserPlaces from "./places/pages/UserPlaces";
// import UpdatePlace from "./places/pages/UpdatePlace";
import { AuthContext } from "./shared/context/auth-context";
import LoadingSpinner from "./shared/components/UIElements/LoadingSpinner";

let logoutTimer

const Users = React.lazy(() => import('./user/pages/Users'))
const NewPlace = React.lazy(() => import('./places/pages/NewPlace'))
const UserPlaces = React.lazy(() => import('./places/pages/UserPlaces'))
const UpdatePlace = React.lazy(() => import('./places/pages/UpdatePlace'))
const Auth = React.lazy(() => import('./user/pages/Auth'))

const App = () => {

  const [userId, setUserId] = useState();
  const [token, setToken] = useState();
  const [tokenExpirationData, settokenExpirationData] = useState();



  const login = useCallback((uid, token, expirationDataAlready) => {
    setToken(token)
    const expirationData = expirationDataAlready || new Date(new Date().getTime() + 1000 * 60 * 60)
    settokenExpirationData(expirationData)
    localStorage.setItem('userData', JSON.stringify({userId: uid, token: token, expiration: expirationData.toISOString()}))
    setUserId(uid)
  }, []);

  const logout = useCallback(() => {
    setUserId(null)
    setToken(null)
    localStorage.removeItem('userData')
  }, []);

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem('userData'))
    if (storedData && storedData.token && new Date(storedData.expiration) > new Date()) {
      login(storedData.userId, storedData.token, new Date(storedData.expiration))
    }
  }, [login])

  useEffect(() => {
    if (token && tokenExpirationData) {
      const remain = tokenExpirationData.getTime() - new Date().getTime()
      logoutTimer = setTimeout(logout, remain)
    }else{
      clearTimeout(logoutTimer)
    }
  }, [token, logout, tokenExpirationData])

  let routes;

  if (token) {
    routes = (
      <Switch>
        <Route path="/" exact>
          <Users />
        </Route>
        <Route path="/:userId/places" exact>
          <UserPlaces />
        </Route>
        
        <Route path="/places/new" exact>
          <NewPlace />
        </Route>
        <Route path="/places/:placeId" exact>
              <UpdatePlace />
            </Route>
        <Redirect to="/" />
      </Switch>
    );
  } else {
    routes = (
      <Switch>
        <Route path="/" exact>
          <Users />
        </Route>
        <Route path="/:userId/places" exact>
          <UserPlaces />
        </Route>
        <Route path="/auth" exact>
          <Auth />
        </Route>
        <Redirect to="/auth" />
      </Switch>
    );
  }

  return (
    <AuthContext.Provider
      value={{ userId:userId, isLoggedIn: !!token, token: token, login: login, logout: logout }}
    >
      <Router>
        <MainNavigation />
        <main>
          <Suspense fallback={
          <div className="center">
            <LoadingSpinner />
          </div>
        }>
            {routes}
          </Suspense>

        </main>
      </Router>
    </AuthContext.Provider>
  );
};

export default App;
