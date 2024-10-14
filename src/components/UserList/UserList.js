// src/components/UserList.js
import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Input,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  IconButton,
  
} from '@mui/material';
import './UserList.css'; // Import custom CSS for additional styles
import { useNavigate } from 'react-router-dom';
import { InfoRounded, MedicalInformationRounded, QuestionMark } from '@mui/icons-material';
import { makeStyles } from '@mui/styles';

const UserList = ({setLoading, refreshFileKeys}) => {
  const [users, setUsers] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null); // Track selected user ID
  const [visiblePublicKeys, setVisiblePublicKeys] = useState({}); // Track which public keys are visible
  const [dialogHelperOpen, setDialogHelperOpen] = useState(false);
  const backendBaseUrl = process.env.REACT_APP_BACKEND_BASE_URL;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await fetch(`${backendBaseUrl}/users/list`);
      const data = await response.json();
      setUsers(data.data);
    };
    fetchUsers();
  }, [backendBaseUrl]);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUploadClick = (userId) => {
    setSelectedUserId(userId); // Set selected user ID
    setUploadDialogOpen(true); // Open upload dialog
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile || !selectedUserId) return;
  
    setLoading(true); // Set loading to true when starting the upload
  
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('id', selectedUserId);
  
    try {
      const response = await fetch(`${backendBaseUrl}/file/uploadFile`, {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error('File upload failed');
      }
  
      const result = await response.json();
      console.log('File uploaded successfully:', result);
      
      // Close the dialog and reset the state
      setUploadDialogOpen(false);
      setSelectedFile(null);
      setSelectedUserId(null);
      refreshFileKeys();
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setLoading(false); // Reset loading state
    }
  };
  

  const togglePublicKeyVisibility = (userId) => {
    setVisiblePublicKeys((prev) => ({
      ...prev,
      [userId]: !prev[userId], // Toggle visibility
    }));
  };

  


  return (
    <Box p={2}>
      {/* Title for Users Section */}
      <Typography variant="h4" gutterBottom>
        <span>Users List</span> <IconButton onClick={() => setDialogHelperOpen(true)}><InfoRounded /></IconButton>
      </Typography>
      <Grid container spacing={2}>
        {users.map((user) => (
          <Grid item xs={12} sm={6} md={4} key={user.id} >
            <Card variant="outlined" sx={{ marginBottom: 2 }} >
              <CardContent>
                <Typography variant="h6">{`${user.firstName} ${user.lastName}`}</Typography>
                <Typography color="textSecondary">ID: {user.id}</Typography>
                <Typography
                  color="textSecondary"
                  onClick={() => togglePublicKeyVisibility(user.id)}
                  style={{ cursor: 'pointer', textDecoration: 'underline' }}
                >
                  {visiblePublicKeys[user.id] ? user.publicKey : 'Show Public Key'}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleUploadClick(user.id)}
                  sx={{ mt: 2 }}
                >
                  Upload File
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* File Upload Dialog */}
      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)}>
        <DialogTitle>Upload File</DialogTitle>
        <DialogContent className="upload-container">
          <div className="upload-overlay"></div>
          <Input type="file" onChange={handleFileChange} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleUploadSubmit} color="primary">
            Upload
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
      open={dialogHelperOpen}
      onClose={() => setDialogHelperOpen(false)}
      sx={{
        '& .MuiDialog-paper': {
          backgroundColor: '#2A2A2A', // Dark background
          borderRadius: '15px',       // Rounded corners
          color: '#fff',              // White text
          padding: '20px',            // Padding for better spacing
          width: '400px',             // Control the dialog width
        },
      }}
    >
      <DialogTitle
        sx={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#1976d2',           // Golden text for the title
          textAlign: 'center',
          marginBottom: '10px',
        }}
      >
        Information
      </DialogTitle>
      <DialogContent
        sx={{
          fontSize: '16px',
          lineHeight: '1.5',
          color: '#ddd',              // Lighter text for better readability
          textAlign: 'center',
        }}
      >
        <Typography>
        This is the user list, allowing you to select a recipient for file uploads. SafeTransfer Hub automatically manages asymmetric encryption in the background, ensuring your files remain secure throughout the transfer process
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => setDialogHelperOpen(false)}
          sx={{
            backgroundColor: '#1976d2', // Golden button color
            color: '#2A2A2A',
            fontWeight: 'bold',
            '&:hover': {
              backgroundColor: 'white',
              color:'black' // Hover effect for the button
            },
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
    </Box>
  );
};

export default UserList;
