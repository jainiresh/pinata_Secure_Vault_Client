// src/components/Loader.js
import React from 'react';
import { CircularProgress, Box } from '@mui/material';

const Loader = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        position: 'fixed',
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        zIndex: 5000,
      }}
    >
      <CircularProgress />
    </Box>
  );
};

export default Loader;
