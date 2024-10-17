const multer = require('multer');


// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Specify the directory to save the image
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Create a unique filename
    },
});

const upload = multer({ storage: storage })

// Middleware to handle image upload
exports.upload = upload.single('image');

exports.saveImage = (req, res) => {
    if (!req.file) {
        console.log("No file received");
        return res.send({
            success: false
        });

    } else {
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        return res.send({
            success: true,
            file: fileUrl
        })
    }
};
