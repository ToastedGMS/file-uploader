const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getFolderContent } = require('./folderController');
const { bucket } = require('..');

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, req.session.currentFolder);
	},
	filename: (req, file, cb) => {
		const ext = path.extname(file.originalname); // Original file extension
		const name = path.basename(file.originalname, ext); // Original filename without extension
		cb(null, `${name}${ext}`); // New filename
	},
});

// Initialize multer with the custom storage
const upload = multer({ storage: storage });

function getUploadView(req, res) {
	if (req.isAuthenticated()) {
		res.render('upload');
	} else {
		res.redirect('/login');
	}
}

// async function handleUploadResponse(req, res) {
// 	upload.single('file')(req, res, async function (error) {
// 		const currentFolder = req.session.currentFolder;
// 		const messages = { error: null, success: null };
// 		const files = await getFolderContent(`${currentFolder}`);

// 		if (error) {
// 			messages.error = 'Unexpected error occurred.';
// 			return res.render('upload', { messages });
// 		}
// 		if (!req.file) {
// 			messages.error = 'No file found.';
// 			return res.render('upload', { messages });
// 		}

// 		// Upload file to Supabase storage
// 		const { originalname, path: filePath, mimetype } = req.file;
// 		const fileContent = fs.readFileSync(filePath);

// 		const { data, error: uploadError } = await supabase.storage
// 			.from('bababooey')
// 			.upload(`${currentFolder}/${originalname}`, fileContent, {
// 				contentType: mimetype,
// 			});

// 		if (uploadError) {
// 			messages.error = 'Failed to upload file to Supabase.';
// 			console.log(uploadError);
// 			return res.render('upload', { messages });
// 		}

// 		messages.success = `File uploaded successfully to Supabase: ${data.path}`;
// 		return res.render('folder', { messages, files, currentFolder });
// 	});
// }
async function handleUploadResponse(req, res) {
	upload.single('file')(req, res, async function (error) {
		const currentFolder = req.session.currentFolder;
		const files = await getFolderContent(`${currentFolder}`);

		const messages = { error: null, success: null };

		if (error) {
			messages.error = 'Unexpected error occurred.';
			return res.render('upload', { messages });
		}
		if (!req.file) {
			messages.error = 'No file found.';
			return res.render('upload', { messages });
		}

		// Upload file to Firebase Storage
		const { originalname, path: filePath, mimetype } = req.file;

		// Set the file reference directly to the bucket (no folders)
		const file = bucket.file(originalname); // Use the original filename directly
		const stream = file.createWriteStream({
			metadata: {
				contentType: mimetype,
			},
		});

		stream.on('error', (err) => {
			messages.error = 'Failed to upload file to Firebase Storage.';
			console.error(err); // Log the error for debugging
			return res.render('upload', { messages });
		});

		stream.on('finish', () => {
			messages.success = `File uploaded successfully to Firebase Storage: ${file.name}`;
			return res.render('folder', { messages, files, currentFolder });
		});

		// Read and stream the file content to Firebase
		fs.createReadStream(filePath).pipe(stream);
	});
}
module.exports = {
	getUploadView,
	handleUploadResponse,
};
