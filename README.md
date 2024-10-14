*This is a submission for the [The Pinata Challenge](https://dev.to/challenges/pinata)*

## What I Built
I built **SafeTransfer Hub**, a secure file-sharing application where users can create accounts, and without sharing any personal information like phonenumbers, emails with other users can send and receive files securely. The core idea is that files can be uploaded and targeted to specific recipients in the app, with top-tier security through encryption.

### **Encryption Mechanism**
SafeTransfer Hub employs a **hybrid encryption approach** using both **symmetric and asymmetric encryption** for robust security. The process is as follows:

- Upon registration, each user is assigned a **public key** and a **private key**.
- When a sender uploads a file targeting a recipient, the file is encrypted with the recipient's public key.
- The encrypted file is stored on Pinata and added to a global file pool visible to all users, including the recipient.
- While anyone can view file entries, all files remain encrypted. Users can attempt to decrypt files using their private key.
- If the file is not intended for that user, their private key cannot decrypt it, ensuring privacy and security.
- The application provides an abstraction in the form of **"Unlock"** and **"Unlock All"** buttons, which automatically handle the decryption process in the background. The **"Unlock All"** feature attempts to decrypt all files in the system, but only files intended for the user are successfully unlocked, as only their private key can decrypt them.


### **Global Pool, Yet Secure**
All users in the system can view a **global pool of files**—entries for every file uploaded—but files remain completely inaccessible unless the user is the intended recipient. When someone tries to access a file they don’t own, they won’t be able to decrypt it because the file is locked with the recipient’s public key, and only that recipient can use their private key to unlock it.

This ensures that files can be securely stored and transferred between users without any unauthorized access, making it an ideal platform for sharing sensitive information.

## Demo

Here is the live website link : [Live website](https://pinata-secure-vault-client.onrender.com/)
<!-- Share a link to your application and include some screenshots here. -->
{% embed https://www.youtube.com/watch?v=Og2fkY1Gb9g %}

Client side code :
{% embed https://github.com/jainiresh/pinata_Secure_Vault_Client %}

Server side code : 
{% embed https://github.com/jainiresh/Pinata_secure_vault_server %}

## More Details
SafeTransfer Hub is built with simplicity, security, and user privacy in mind. Users can safely store and share files with recipients while being assured that no one else can access their data.
