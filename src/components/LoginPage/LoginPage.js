// src/pages/LoginPage.js
import React from 'react';
import Header from '../Header/Header';
import './LoginPage.css'; // Import the CSS file

const LoginPage = ({ setUserDetails, setIsLoggedIn }) => {
  return (
    <div className="login-page"> {/* Apply the login-page class for styling */}
      <Header 
        isLoggedIn={false} // Pass false since this is the login page
        setUserDetails={setUserDetails} 
        setIsLoggedIn={setIsLoggedIn} 
        userDetails={{}} // No user details at this point
      />
      {/* Add any other login-specific content here if needed */}
    </div>
  );
};

export default LoginPage;
