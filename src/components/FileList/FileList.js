import { Button, Card, CardContent, Typography, Box, CircularProgress } from '@mui/material';
import React, { useEffect, useState } from 'react';
import './FileList.css'; // Import custom CSS for additional styles

const FileList = ({ userDetails, setLoading, fileKeyList, setFileKeyList }) => {
  let url = `${process.env.REACT_APP_BACKEND_BASE_URL}`;

  
  const [unlockedFiles, setUnlockedFiles] = useState([]); // Track which files are unlocked
  const [loadingFiles, setLoadingFiles] = useState([]); // Track which files are being decrypted
  const [unlockAllInProgress, setUnlockAllInProgress] = useState(false); // Track the global unlock process

 

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
      <Typography variant="h4" className="file-list-title">
        Uploaded Pinata Cloud Files
      </Typography>
      <Typography variant='h6' sx={{fontSize: '1rem', marginLeft: '30vw', marginBottom: '7rem'}}>
       ( Your private key is validated against all the encryptions, and your file gets unloacked only when they are intended to you. )
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
              <Typography className="file-id">
                File Id: {file._id}
              </Typography>
              <Typography variant="body2" className="file-url">
                 CID hash: {file.pinataUrl.split("/")[4]}
            
              </Typography>

              <Button
                variant="contained"
                sx={{marginRight : '1rem'}}
                color={unlockedFiles.includes(index) ? 'success' : 'primary'}
                className="unlock-button"
                disabled={unlockedFiles.includes(index)} 
                onClick={() => unlockAssymetricEncryption(file, index)}
              >
                {loadingFiles.includes(index) ? (
                  <CircularProgress size={24} /> 
                ) : unlockedFiles.includes(index) ? (
                  'Unlocked'
                ) : (
                  'Locked'
                )}
              </Button>
              {unlockedFiles.includes(index) ? <Button variant='contained' onClick={() => getIntendedFile(file)}>Get File</Button> : <></>}
            </CardContent>
          </Card>
        ))}
      </Box>
    </div>
  );
};

export default FileList;
