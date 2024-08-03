const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const sharp = require('sharp'); // For image processing

// Configure AWS S3
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

// Set up multer storage with S3
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.S3_BUCKET_NAME,
        acl: 'public-read', // Adjust permissions as needed
        key: function (req, file, cb) {
            cb(null, Date.now().toString() + '-' + file.originalname); // File name
        }
    }),
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
});

// Function to upload and process image as middleware
const uploadImageMiddleware = (req, res, next) => {
    upload.single('image')(req, res, async (err) => { // Assuming 'image' is the field name
        if (err) {
            return res.status(500).json({ error: "Image upload failed: " + err.message });
        }
        try {
            const file = req.file; // Get the uploaded file
            const processedImage = await sharp(file.buffer)
                .resize(800, 800) // Resize image
                .toBuffer();

            const uploadResult = await s3.upload({
                Bucket: process.env.S3_BUCKET_NAME,
                Key: Date.now().toString() + '-' + file.originalname,
                Body: processedImage,
                ACL: 'public-read',
            }).promise();

            req.imageUrl = uploadResult.Location; // Store the image URL in the request object
            next(); // Proceed to the next middleware or route handler
        } catch (error) {
            return res.status(500).json({ error: "Image processing failed: " + error.message });
        }
    });
};

// Export the middleware
module.exports = { uploadImageMiddleware }; // Export the uploadImageMiddleware