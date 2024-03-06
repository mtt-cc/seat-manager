/*
 * EXAM 2 
 * MATTEO CICILLONI s315040
 * 
 */

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';

import { React, useState, useEffect, useContext } from 'react';
import { Container, Toast } from 'react-bootstrap/'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { Navigation } from './components/Navigation';
import { MainLayout, SeatsLayout, DefaultLayout, NotFoundLayout, LoginLayout, LoadingLayout } from './components/PageLayout';

import MessageContext from './messageCtx';
import API from './API';

function App() {

  // TO CHANGE, DEBUG ONLY
  const [dirty, setDirty] = useState(true);

  // This state keeps track if the user is currently logged-in.
  const [loggedIn, setLoggedIn] = useState(false);
  // This state contains the user's info.
  const [user, setUser] = useState(null);

  // This state contains the list of planes (it is initialized from a predefined array).
  const [planes, setPlanes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // If an error occurs, the error message will be shown in a toast.
  const handleErrors = (err) => {
    let msg = '';
    if (err.error) msg = err.error;
    else if (String(err) === "string") msg = String(err);
    else msg = "Unknown Error";
    setMessage(msg); 
  }

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const user = await API.getUserInfo();  // here you have the user info, if already logged in
        setUser(user);
        setLoggedIn(true); setLoading(false);
      } catch (err) {
        handleErrors(err); // mostly unauthenticated user, thus set not logged in
        setUser(null);
        setLoggedIn(false); setLoading(false);
      }
    };
    init();
  }, []);  // This useEffect is called only the first time the component is mounted.

  /**
   * This function handles the login process.
   * It requires a username and a password inside a "credentials" object.
   */
  const handleLogin = async (credentials) => {
    try {
      const user = await API.logIn(credentials);
      setUser(user);
      setLoggedIn(true);
    } catch (err) {
      // error is handled and visualized in the login form, do not manage error, throw it
      throw err;
    }
  };

  /**
   * This function handles the logout process.
   */ 
  const handleLogout = async () => {
    await API.logOut();
    setLoggedIn(false);
    // clean up everything
    setUser(null);
  };

  useEffect(() => {
      API.getPlanes()
        .then(planes => {
          setPlanes(planes);
          setDirty(false);
        })
        .catch(e => { 
          handleErrors(e);
          setDirty(false); 
        } ); 
  }, []);

  return (
    <BrowserRouter>
      <MessageContext.Provider value={{ handleErrors }}>
        <Container fluid className="App">
          <Navigation logout={handleLogout} user={user} loggedIn={loggedIn} />

          <Routes>
            <Route path="/" element={
            loading ? <LoadingLayout /> : <DefaultLayout planes={planes} />
            } >
              <Route index element={ <MainLayout planes={planes} setPlanes={setPlanes} dirty={dirty} setDirty={setDirty} />} />
              <Route path="/booking/:planeId" element=
              {<SeatsLayout /*seats={seats} setSeats={setSeats}*/  planes={planes} user={user}
              dirty={dirty} setDirty={setDirty}
              loggedIn={loggedIn}/>} />
              <Route path="*" element={<NotFoundLayout />} />
            </Route>
            <Route path="/login" element={<LoginLayout login={handleLogin} />} />
          </Routes>

          <Toast show={message !== ''} onClose={() => setMessage('')} delay={4000} autohide bg="danger">
            <Toast.Body>{message}</Toast.Body>
          </Toast>
        </Container>
      </MessageContext.Provider>
    </BrowserRouter>
  );

}

export default App;
