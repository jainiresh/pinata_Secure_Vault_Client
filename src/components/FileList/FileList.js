import { Button, Card, CardContent, Typography, Box, CircularProgress, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import React, { useEffect, useState } from 'react';
import './FileList.css'; // Import custom CSS for additional styles
import { InfoRounded, Lock, LockOpen, LockOpenSharp } from '@mui/icons-material';

const FileList = ({ userDetails, setLoading, fileKeyList, setFileKeyList }) => {
  let url = `${process.env.REACT_APP_BACKEND_BASE_URL}`;


  const [unlockedFiles, setUnlockedFiles] = useState([]); // Track which files are unlocked
  const [loadingFiles, setLoadingFiles] = useState([]); // Track which files are being decrypted
  const [unlockAllInProgress, setUnlockAllInProgress] = useState(false); // Track the global unlock process
  const [hoveringFileIndex, setHoveringFileIndex] = useState(null);
  const [dialogHelperOpen, setDialogHelperOpen] = useState(false);



  // Function to import the RSA private key
  async function importPrivateKey(pemKey) {
    const binaryDerString = window.atob(pemKey.replace(/-----\w+ PRIVATE KEY-----/g, '').trim());
    const binaryDer = str2ab(binaryDerString); // Convert string to ArrayBuffer

    return await window.crypto.subtle.importKey(
      "pkcs8",
      binaryDer,
      {
        name: "RSA-OAEP",
        hash: "SHA-256",
      },
      true,
      ["decrypt"]
    );
  }

  // Helper function to convert a base64 string to ArrayBuffer
  function str2ab(str) {
    const buf = new ArrayBuffer(str.length);
    const bufView = new Uint8Array(buf);
    for (let i = 0, strLen = str.length; i < strLen; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return buf;
  }

  // Function to decrypt the AES key using the RSA private key
  async function decryptAesKeyWithRSA(encryptedAesKey, privateKeyPem) {
    const privateKey = await importPrivateKey(privateKeyPem);
    const decryptedAesKey = await window.crypto.subtle.decrypt(
      {
        name: "RSA-OAEP",
      },
      privateKey,
      encryptedAesKey
    );
    return new Uint8Array(decryptedAesKey);
  }

  // Function to unlock asymmetric encryption for a single file
  const unlockAssymetricEncryption = async (file, index) => {
    setLoadingFiles(prev => [...prev, index]); // Show loader for this file

    let privateKey = userDetails.privateKey;
    let encryptedAesKeyBase64 = file.encryptedAesKey;

    const encryptedAesKey = Uint8Array.from(atob(encryptedAesKeyBase64), c => c.charCodeAt(0));

    try {
      await decryptAesKeyWithRSA(encryptedAesKey, privateKey);
      setUnlockedFiles(prev => [...prev, index]); // Mark this file as unlocked
    } catch (error) {
      console.error('Decryption failed:', error);
    } finally {
      setLoadingFiles(prev => prev.filter(i => i !== index)); // Hide loader after decryption
    }
  };

  // Function to unlock all files
  const unlockAllFiles = async () => {
    setUnlockAllInProgress(true);
    for (let i = 0; i < fileKeyList.length; i++) {
      if (!unlockedFiles.includes(i)) {
        await unlockAssymetricEncryption(fileKeyList[i], i);
      }
    }
    setUnlockAllInProgress(false);
  };

  const getIntendedFile = async (file) => {
    setLoading(true); // Set loading to true when starting file retrieval

    const requestBody = {
      pinataUrl: file.pinataUrl,
      encryptedAesKey: file.encryptedAesKey,
      id: userDetails.id,
    };

    try {
      const response = await fetch(`${url}/file/getFile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      // Get the response as a blob
      const blob = await response.blob();
      const imaegUrl = window.URL.createObjectURL(blob);

      // Create a link element to trigger the download
      const a = document.createElement('a');
      a.href = imaegUrl;
      a.download = file._id; // You can set the filename as needed
      document.body.appendChild(a);
      a.click();

      // Clean up
      a.remove();
      window.URL.revokeObjectURL(imaegUrl);
      console.log('File retrieved and download initiated successfully.');
    } catch (error) {
      console.error('Error fetching file:', error);
    } finally {
      setLoading(false); // Reset loading state
    }
  };



  return (
    <div className="file-list-container">
      <Typography variant="h3" className="file-list-title">
        <span style={{color : 'black'}}>Uploaded Pinata Cloud Files</span><IconButton onClick={() => setDialogHelperOpen(true)}><InfoRounded /></IconButton>
      </Typography>
      <Typography variant='h6' sx={{ fontSize: '1.3rem', color: 'black', marginLeft: '28vw', marginBottom: '7rem', fontStyle: 'italic' }}>
        ( "Your private key seamlessly decrypts only the files meant for you, ensuring that access is exclusive and secure." )
      </Typography>

      {/* Global Unlock All Button */}
      <Button
        variant="contained"
        color="secondary"
        onClick={unlockAllFiles}
        disabled={unlockAllInProgress || unlockedFiles.length === fileKeyList.length}
      >
        {unlockAllInProgress ? 'Unlocking All...' : 'Unlock All'}
      </Button>

      <Box className="file-list">
        {fileKeyList.map((file, index) => (
          <Card key={index} className="file-card">
            <CardContent>
              <div>
                <Typography style className="file-id">
                  <span style={{ fontWeight: 'bold' }}>File Id :</span> {file._id}
                </Typography>
                <Typography variant="body2" className="file-url">
                  <span style={{ fontWeight: 'bold' }}>CID Hash :</span> {file.pinataUrl.split("/")[4]}

                </Typography>
              </div>
              <div style={{ display: 'flex' }}>
                <Button
                  variant="contained"
                  sx={{ marginRight: '1rem' }}
                  color={unlockedFiles.includes(index) ? 'success' : 'primary'}
                  className="unlock-button"
                  disabled={unlockedFiles.includes(index)}
                  onClick={() => unlockAssymetricEncryption(file, index)}
                  onMouseEnter={() => setHoveringFileIndex(index)} // Set the current file index on hover
                  onMouseLeave={() => setHoveringFileIndex(null)}  // Reset on mouse leave
                >
                  {loadingFiles.includes(index) ? (
                    <CircularProgress size={24} />
                  ) : unlockedFiles.includes(index) ? (
                    <div style={{ fontSize: '1rem', display: 'flex', justifyContent: 'space-between' }}> Unlocked <LockOpenSharp sx={{ paddingLeft: '0.1rem' }} /></div>
                  ) : (
                    <div style={{ fontSize: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                      {hoveringFileIndex === index ? 'Unlock' : 'Locked'} <Lock sx={{ paddingLeft: '0.1rem' }} />
                    </div>
                  )}
                </Button>
                {unlockedFiles.includes(index) ? <Button className="unlock-button" variant='contained' onClick={() => getIntendedFile(file)}>Get File</Button> : <></>}
              </div>
            </CardContent>
          </Card>
        ))}
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
        "This is the file list displaying all files securely shared with recipients. You can attempt to unlock and decrypt these files individually or click on the 'Unlock All' button to attempt decryption for all files at once. Rest assured, only files specifically intended for you will be successfully unlocked.
        <br  />
        <br />
<span style={{fontWeight: 'bold'}}>Background Information:<br/></span>
Your private key is utilized to decrypt files that have been encrypted with your public key, ensuring that access remains exclusive and secure."
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
    </div>
  );
};

export default FileList;
