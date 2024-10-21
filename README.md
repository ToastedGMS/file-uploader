Personal Storage Service 
This is a work-in-progress project that emulates basic functionalities of a personal cloud storage service (like Google Drive). The project is built with Node.js, using Express for the server-side, Prisma as the ORM, Passport.js for session-based authentication, and Firebase for cloud storage.

Features
User Authentication:

Implemented using Passport.js for session management, allowing users to securely log in and access their storage.
Prisma is used to persist session data in the database.
File Uploads:

Authenticated users can upload files, which are currently stored locally using Multer.
In the future, files will be uploaded directly to Firebase cloud storage (Firebase is already integrated).
Folder Management:

Users can create, update, delete, and view folders.
Files can be organized within these folders.
File Management:

Files are stored with metadata such as name, size, and upload time.
Each file can be downloaded via a download button.
Cloud Storage:

Files are uploaded to Firebase Cloud Storage.
Future plans include adding more features and improving file handling logic.
Tech Stack
Backend:

Node.js with Express
Prisma ORM for database interactions
Passport.js for session-based authentication
Multer middleware for handling file uploads
Firebase Cloud Storage for storing files
Database:

Prisma with PostgreSQL

Future Plans
Store file URLs in the database.
Improve file management by optimizing how files are uploaded and accessed.
Implement more robust folder management.
Enhance the UI for better user experience.
Expand file storage to handle larger file sizes efficiently.
Contributions
Contributions are welcome! Feel free to open an issue or submit a pull request to discuss any features or improvements you'd like to see.
