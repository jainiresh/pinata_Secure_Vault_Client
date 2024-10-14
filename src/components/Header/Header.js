import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'
import './Header.css';
import { Button, Dialog, DialogTitle, DialogContent, TextField, DialogActions } from '@mui/material';
import lockLogo from '../../assets/lock2.jpeg'; // Adjust the path as necessary

const Header = ({ isLoggedIn, setUserDetails, setIsLoggedIn, userDetails }) => {
  const [open, setOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const backendBaseUrl = process.env.REACT_APP_BACKEND_BASE_URL;

  const [loginCreds, setLoginCreds] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });

  // useEffect(() => {
  //   if (isLoggedIn)
  //     setOpen(false)
  //   else
  //     setOpen(true)
  // }, [isLoggedIn])


  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      let url = isLogin ? `${backendBaseUrl}/auth/login` : `${backendBaseUrl}/auth/register`
      let response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginCreds)
      });

      if (!response.ok) {
        navigate('/')
        throw new Error('Error submitting login credentials');
        
      }

      const data = await response.json();

      if (data.success == 1) {
        setOpen(false)
        setIsLoggedIn(true)
        setUserDetails((prevState) => ({
          ...prevState,
          privateKey: data.privateKey,
          id: data.id,
          firstName: data.firstName,
          lastName: data.lastName
        }))
        navigate('/')
      }else{
        navigate('/')
      }
      console.log('Login successful:', data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleLoginCredsChange = (e) => {
    const { id, value } = e.target; // Extract id and value from event
    setLoginCreds((prevCreds) => ({
      ...prevCreds,
      [id]: value, // Update only the specific field
    }));
  };

  const handleLogout = () => {
    window.location.reload();
  }

  return (
    <header className={isLoggedIn ? 'navbar-login': 'navbar'}>
      {!open && <div className="navbar-logo">
        <h1>SafeTransfer Hub</h1>
        {!open && !isLoggedIn && (
          <Button sx={{
            color: 'whitesmoke', fontSize: '1rem', marginLeft: '4rem', transition: 'background-color 0.3s ease, transform 0.3s ease', // Add transition
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.2)', // Change background color on hover
              transform: 'scale(5.05)', // Slightly increase size on hover
            },
          }} onClick={handleClickOpen}>
            Enter Realm
          </Button>
        )}
      </div>}
      <div className="navbar-buttons">
        {isLoggedIn ? (
          <>
          <span style={{ paddingRight: '1rem', color:'white', fontWeight:'bolder', fontSize:'1.1rem' }}>Name : {userDetails.firstName} {userDetails.lastName}</span>
            <span style={{ paddingRight: '1rem', color:'white', fontWeight:'bolder', fontSize:'1.1rem' }}>AccountID : {userDetails.id}</span>
            <Button className="auth-button" onClick={handleLogout}>
              Logout
            </Button>
          </>
        ) : null}
      </div>

      {/* Dialog Box for Login/Register */}
      <Dialog open={open} onClose={handleClose} className="dialog-box">
        <DialogTitle className="dialog-title">{isLogin ? `Login` : `Register`}</DialogTitle>
        <DialogContent className="dialog-content">
          {!isLogin ?
            (<>
              <TextField
                margin="dense"
                id="firstName"
                label="First Name"
                autoComplete='off'
                type="text"
                fullWidth
                onChange={handleLoginCredsChange}
                value={loginCreds.firstName}
                variant="outlined"
                InputLabelProps={{
                  style: { color: 'white', fontSize: '1.3rem' },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'transparent', // Custom background color
                    '& fieldset': {
                      borderColor: '#777', // Border color
                    },
                    '&:hover fieldset': {
                      borderColor: '#f0f0f0', // Border color on hover
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#f0f0f0', // Border color when focused
                    }, '& input': {
                      color: 'white', // Text color for the input
                    },
                  },
                }}
              />
              <TextField
                margin="dense"
                id="lastName"
                label="Last Name"
                type="text"
                autoComplete='off'
                fullWidth
                variant="outlined"
                onChange={handleLoginCredsChange}
                value={loginCreds.lastName}
                InputLabelProps={{
                  style: { color: 'white', fontSize: '1.3rem' },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'transparent', // Custom background color
                    '& fieldset': {
                      borderColor: '#777', // Border color
                    },
                    '&:hover fieldset': {
                      borderColor: '#f0f0f0', // Border color on hover
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#f0f0f0', // Border color when focused
                    }, '& input': {
                      color: 'white', // Text color for the input
                    },
                  },
                }}
              />
            </>) : null
          }
          <TextField
            margin="dense"
            id="email"
            label="Email Address"
            autoComplete='off'
            type="email"
            fullWidth
            onChange={handleLoginCredsChange}
            value={loginCreds.email}
            variant="outlined"
            InputLabelProps={{
              style: { color: 'white', fontSize: '1.3rem' },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'transparent', // Custom background color
                '& fieldset': {
                  borderColor: '#777', // Border color
                },
                '&:hover fieldset': {
                  borderColor: '#f0f0f0', // Border color on hover
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#f0f0f0', // Border color when focused
                }, '& input': {
                  color: 'white', // Text color for the input
                },
              }
            }}
          />

          <TextField
            margin="dense"
            id="password"
            label="Password"
            autoComplete='off'
            type="password"
            fullWidth
            variant="outlined"
            onChange={handleLoginCredsChange}
            value={loginCreds.password}
            InputLabelProps={{
              style: { color: 'white', fontSize: '1.3rem' },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'transparent', // Custom background color
                '& fieldset': {
                  borderColor: '#777', // Border color
                },
                '&:hover fieldset': {
                  borderColor: '#f0f0f0', // Border color on hover
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#f0f0f0', // Border color when focused
                }, '& input': {
                  color: 'white', // Text color for the input
                },
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsLogin(!isLogin)}>{isLogin ? `Register here` : `Login here`}</Button>
          <Button onClick={handleClose} className="cancel-button">Cancel</Button>
          <Button onClick={handleSubmit} className="submit-button">Submit</Button>
        </DialogActions>
      </Dialog>


    </header>
  );
};

export default Header;
