const fs = require('fs');
const util = require('util');

// Convert fs.readdir into a function that returns a promise (for using async/await consistently)
const readdir = util.promisify(fs.readdir);

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
			res.render('folder', { files });
		} catch (err) {
			if (err.code === 'ENOENT') {
				currentFolder = './uploads';
				folderHistory = []; // Clear the folder history
				return await getFolderView(req, res);
			} else if (err.code === 'ENOTDIR') {
				currentFolder = './uploads';
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
		return files;
	} catch (err) {
		throw new Error('Unable to read folder: ' + err);
	}
}

module.exports = { getNewFolder, getPreviousFolder, getFolderView };
