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
	folderHistory.push(currentFolder);
	currentFolder = `${currentFolder}/${req.query.folderName}`;

	await getFolderView(req, res);
}

async function getPreviousFolder(req, res) {
	// Check if there's a previous folder in the stack

	if (folderHistory.length > 0) {
		// Pop the last folder from the stack and set it as the current folder
		currentFolder = folderHistory.pop();
		console.log('Navigating to previous folder:', currentFolder);
	}

	await getFolderView(req, res);
}

async function getFolderView(req, res) {
	if (req.isAuthenticated()) {
		try {
			const files = await getFolderContent();
			res.render('folder', { files, currentFolder });
		} catch (err) {
			if (err.code === 'ENOENT') {
				currentFolder = rootFolder;
				folderHistory = []; // Clear the folder history
				return await getFolderView(req, res);
			} else if (err.code === 'ENOTDIR') {
				currentFolder = rootFolder;
				folderHistory = []; // Clear the folder history
				return await getFolderView(req, res);
			} else {
				res.status(500).send('Error loading folder contents: ' + err);
			}
		}
	} else {
		res.redirect('/login');
	}
}
async function getFolderContent() {
	try {
		const files = await readdir(currentFolder);
		const result = [];

		for (const file of files) {
			try {
				const stats = await stat(`${currentFolder}/${file}`);
				result.push({ name: file, isFile: stats.isFile() });
			} catch (err) {
				console.error(`Error getting stats for ${file}: ${err}`);
			}
		}

		return result;
	} catch (err) {
		throw new Error('Unable to read folder: ' + err);
	}
}

async function renameDirectory(req, res) {
	const newName = req.body.rename;
	const previousFolder = folderHistory.pop(); // Get the previous folder from the history

	try {
		if (currentFolder === rootFolder) {
			await getFolderView(req, res);
			return;
		}
		const newPath = path.join(previousFolder, newName);
		await rename(currentFolder, newPath);
		currentFolder = rootFolder;
		folderHistory = [];

		folderHistory.push(currentFolder);

		await getFolderView(req, res);
	} catch (err) {
		console.error('Error renaming directory:', err);
		res.status(500).send('Error renaming directory: ' + err);
	}
}

async function deleteFolder(req, res) {
	try {
		if (currentFolder === rootFolder) {
			await getFolderView(req, res);
			return;
		}
		await remove(currentFolder, { recursive: true, force: true });

		currentFolder = rootFolder;

		folderHistory = [];
		folderHistory.push(currentFolder);

		await getFolderView(req, res);
	} catch (err) {
		console.error('Error deleting folder:', err);
		res.status(500).send('Error deleting folder: ' + err);
	}
}

async function deleteFile(req, res) {
	try {
		const file = req.body.fileName;
		const filePath = path.join(currentFolder, file); // Safely join the path

		await unlink(filePath);
		await getFolderView(req, res);
	} catch (error) {
		console.error('Error removing file:', error);
		res.status(500).send('Error deleting file: ' + err);
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
};
