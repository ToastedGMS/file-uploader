const fs = require('fs');
const util = require('util');

// Convert fs.readdir into a function that returns a promise (for using async/await consistently)
const readdir = util.promisify(fs.readdir);

async function getFolderView(req, res) {
	if (req.isAuthenticated()) {
		try {
			const files = await getFolderContent();
			res.render('folder', { files });
		} catch (err) {
			res.status(500).send('Error loading folder contents: ' + err);
		}
	} else {
		res.redirect('/login');
	}
}

async function getFolderContent() {
	const folder = currentFolder;

	try {
		const files = await readdir(folder);
		return files;
	} catch (err) {
		throw new Error('Unable to read folder: ' + err);
	}
}

module.exports = { getFolderView, getFolderContent };
