const AWS = require('aws-sdk');
const multer = require('multer');
require('dotenv').config();
const crypto = require('crypto')

const uploadS3 = multer();

// Configure AWS S3
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const uploadImageToS3 = async (file) => {
    console.log(file);
    const result = await s3.upload({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: file.originalname,
        Body: file.buffer,
        ACL: 'public-read',
    }).promise();
    return result.Location; // Return the URL of the uploaded image
};

// Middleware to convert image file to URL
const imageUploadMiddleware = async (req, res, next) => {
    try {
        const imageUrl = await uploadImageToS3(req.file); // Convert image to URL
        req.imageUrl = imageUrl; // Attach the URL to the request object
        next(); // Proceed to the next middleware/controller
    } catch (error) {
        res.status(500).send({ error }); // Handle errors
    }
};

module.exports = {
    uploadImageToS3,
    imageUploadMiddleware,
};
