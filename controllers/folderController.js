const fs = require('fs');
const util = require('util');
const path = require('path');

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
	req.session.currentFolder = `${req.session.currentFolder}/${req.query.folderName}`;

	await getFolderView(req, res);
}

async function getPreviousFolder(req, res) {
	// Check if there's a previous folder in the stack

	if (req.session.folderHistory.length > 1) {
		// Pop the last folder from the stack and set it as the current folder
		req.session.currentFolder = req.session.folderHistory.pop();
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
				const stats = await stat(`${currentFolder}/${file}`);
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

async function deleteFile(req, res) {
	try {
		const file = req.body.fileName;
		const filePath = path.join(req.session.currentFolder, file); // Safely join the path

		await unlink(filePath);
		await getFolderView(req, res);
	} catch (error) {
		console.error('Error removing file:', error);
		res.status(500).send('Error deleting file: ' + err);
	}
}

function downloadFile(req, res) {
	// Get the file name from the query or request params
	const fileName = req.query.fileName;

	// Assuming files are stored in the 'uploads' directory
	const directoryPath = path.join(__dirname, '../', req.session.currentFolder);
	const filePath = path.join(directoryPath, fileName);

	// Serve the file using res.download
	res.download(filePath, (err) => {
		if (err) {
			console.error('Error downloading the file:', err);
			return res.status(500).send('Error downloading file');
		}
		console.log('Download Completed');
	});
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
};
