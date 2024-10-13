// src/App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage/LoginPage.js';
import UserList from './components/UserList/UserList';
import FileList from './components/FileList/FileList';
import Loader from './components/Loader/Loader.js';
import Header from './components/Header/Header.js';

const App = () => {
  let url = `${process.env.REACT_APP_BACKEND_BASE_URL}`;

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userDetails, setUserDetails] = useState({
    privateKey: '',
    id: ''
  });
  const [loading, setLoading] = useState(false);
  const [fileKeyList, setFileKeyList] = useState([]);

    const refreshFileKeys = async () => {
      let response = await fetch(url+'/file/fileKeys');
      response = await response.json();
      setFileKeyList(response.data);
    };

    useEffect(() => {
      refreshFileKeys();
    }, [])
    

  

  return (
    <Router>
      {loading && <Loader />} {/* Show loader when loading is true */}
      <Routes>
        <Route 
          path="/" 
          element={isLoggedIn ? 
            <div style={{
              
          }}>
              <Header 
        isLoggedIn={isLoggedIn} // Pass false since this is the login page
        setUserDetails={setUserDetails} 
        userH
        setIsLoggedIn={setIsLoggedIn} 
        userDetails={userDetails} // No user details at this point
          />
            <div style={{display: 'flex', flexDirection: 'column', justifyContent:'space-between'}}>
              <UserList refreshFileKeys={refreshFileKeys} setLoading={setLoading} />
              <FileList userDetails={userDetails} setLoading={setLoading} fileKeyList={fileKeyList} setFileKeyList={setFileKeyList} />
              </div>
            </div> : 
            <Navigate to="/login" />
          } 
        />
        <Route 
          path="/login" 
          element={
            <LoginPage 
              setUserDetails={setUserDetails} 
              setIsLoggedIn={setIsLoggedIn} 
            />
          } 
        />
      </Routes>
    </Router>
  );
};

export default App;
