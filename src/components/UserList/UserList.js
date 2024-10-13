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
} from '@mui/material';
import EncryptedLockImage from '../../assets/lock.png'; // Adjust path as necessary
import './UserList.css'; // Import custom CSS for additional styles
import { useNavigate } from 'react-router-dom';

const UserList = ({setLoading, refreshFileKeys}) => {
  const [users, setUsers] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null); // Track selected user ID
  const [visiblePublicKeys, setVisiblePublicKeys] = useState({}); // Track which public keys are visible
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
        Users
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
          <div className="upload-overlay"></div> {/* Overlay div for opacity effect */}
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
    </Box>
  );
};

export default UserList;
