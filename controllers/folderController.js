const fs = require('fs');
const util = require('util');
const path = require('path');
const { Storage } = require('@google-cloud/storage');
const { serviceAccount } = require('..');

// Convert fs.readdir into a function that returns a promise (for using async/await consistently)
const readdir = util.promisify(fs.readdir);
const rename = util.promisify(fs.rename);
const remove = util.promisify(fs.rm);
const stat = util.promisify(fs.stat);
const unlink = util.promisify(fs.unlink);

const messages = { error: null, success: null };

async function getNewFolder(req, res) {
	// Push the current folder onto the stack before navigating
	req.session.folderHistory.push(req.session.currentFolder);
	req.session.currentFolder = path.join(
		req.session.currentFolder,
		req.query.folderName
	);

	await getFolderView(req, res);
}

async function getPreviousFolder(req, res) {
	// Check if there's a previous folder in the stack

	if (req.session.folderHistory.length > 0) {
		// Pop the last folder from the stack and set it as the current folder
		req.session.currentFolder = req.session.folderHistory.pop();
	} else {
		console.log('Error getting previous folder');
	}

	await getFolderView(req, res);
}

async function getFolderView(req, res) {
	if (req.isAuthenticated()) {
		try {
			const currentFolder = req.session.currentFolder;
			const files = await getFolderContent(`${currentFolder}`); // Pass currentFolder to getFolderContent
			res.render('folder', { files, currentFolder, messages });
		} catch (err) {
			// Handle different error codes appropriately
			if (err.code === 'ENOENT' || err.code === 'ENOTDIR') {
				req.session.currentFolder = req.session.rootFolder;
				req.session.folderHistory = []; // Clear the folder history
				return await getFolderView(req, res);
			} else {
				res.status(500).send('Error loading folder contents: ' + err.message);
			}
		}
	} else {
		res.redirect('/login');
	}
}

async function getFolderContent(currentFolder) {
	try {
		const files = await readdir(currentFolder);
		const result = [];

		for (const file of files) {
			try {
				const stats = await stat(path.join(currentFolder, file));
				result.push({ name: file, isFile: stats.isFile() });
			} catch (err) {
				console.error(`Error getting stats for ${file}: ${err}`);
				throw err;
			}
		}

		return result;
	} catch (err) {
		throw new Error('Unable to read folder: ' + err);
	}
}

async function renameDirectory(req, res) {
	const newName = req.body.rename;
	const previousFolder = req.session.folderHistory.pop(); // Get the previous folder from the history

	try {
		if (req.session.currentFolder === req.session.rootFolder) {
			await getFolderView(req, res);
			return;
		}
		const newPath = path.join(previousFolder, newName);
		await rename(req.session.currentFolder, newPath);
		req.session.currentFolder = req.session.rootFolder;
		req.session.folderHistory = [];

		req.session.folderHistory.push(req.session.currentFolder);

		await getFolderView(req, res);
	} catch (err) {
		console.error('Error renaming directory:', err);
		res.status(500).send('Error renaming directory: ' + err);
	}
}

async function deleteFolder(req, res) {
	try {
		if (req.session.currentFolder === req.session.rootFolder) {
			await getFolderView(req, res);
			return;
		}
		await remove(req.session.currentFolder, { recursive: true, force: true });

		req.session.currentFolder = req.session.rootFolder;

		req.session.folderHistory = [];
		req.session.folderHistory.push(req.session.currentFolder);

		await getFolderView(req, res);
	} catch (err) {
		console.error('Error deleting folder:', err);
		res.status(500).send('Error deleting folder: ' + err);
	}
}
function createFolder(req, res) {
	const newFolderPath = path.join(req.session.currentFolder, req.body.dir);

	fs.mkdir(newFolderPath, { recursive: true }, async (err) => {
		const currentFolder = req.session.currentFolder;
		const messages = { error: null, success: null };
		const files = await getFolderContent(`${currentFolder}`);

		if (err) {
			messages.error = `Error creating folder: ${err.message}`;
		} else {
			messages.success = `Folder created successfully: ${newFolderPath}`;
		}

		// Pass messages to the 'upload' view
		return res.render('folder', { messages, files, currentFolder });
	});
}

async function deleteFile(req, res) {
	try {
		const fileName = req.body.fileName;

		const storage = new Storage({
			projectId: 'file-uploader42069', // Replace with your project ID
			credentials: serviceAccount,
		});
		const bucket = storage.bucket('file-uploader42069.appspot.com'); // Replace with your bucket name
		const fileRef = bucket.file(fileName); // Use only the original file name

		// Delete the file from Firebase Storage
		await fileRef.delete();
		try {
			const filePath = path.join(req.session.currentFolder, fileName); // Safely join the path

			await unlink(filePath); // remove file from local storage
		} catch (error) {
			console.error('Error removing file:', error);
			res.status(500).send('Error deleting file: ' + err);
		}

		// After deleting, update the folder view
		await getFolderView(req, res);
	} catch (error) {
		console.error('Error deleting file from Firebase Storage:', error);
		res.status(500).send('Error deleting file: ' + error.message);
	}
}

async function downloadFile(req, res) {
	try {
		const fileName = req.query.fileName;

		const storage = new Storage({
			projectId: 'file-uploader42069', // Replace with your project ID
			credentials: serviceAccount,
		});
		const bucket = storage.bucket('file-uploader42069.appspot.com'); // Replace with your bucket name
		const fileRef = bucket.file(fileName); // Use only the original file name

		// Fetch file metadata to get contentType
		const [metadata] = await fileRef.getMetadata();
		const contentType = metadata.contentType || 'application/octet-stream'; // Default to binary if undefined

		// Download the file from Firebase Storage
		const [data] = await fileRef.download();

		// Set the response headers for download
		res.setHeader('Content-Type', contentType);
		res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

		// Send the file data to the client
		res.send(data);
	} catch (error) {
		console.error('Error downloading file:', error);
		res.status(500).send('Error downloading file: ' + error);
	}
}

module.exports = {
	getNewFolder,
	getPreviousFolder,
	getFolderView,
	renameDirectory,
	deleteFolder,
	deleteFile,
	getFolderContent,
	downloadFile,
	createFolder,
};
