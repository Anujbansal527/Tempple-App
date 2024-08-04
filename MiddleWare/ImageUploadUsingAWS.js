require('dotenv').config();
const AWS = require('aws-sdk');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() }); // Store files in memory

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

async function uploadImageToS3(file) {
    const params = {
        Bucket: process.env.S3_BUCKET_NAME, // Use the bucket name from .env
        Key: `images/${file.originalname}`, // File name you want to save as in S3
        Body: file.buffer, // The file data
        ContentType: file.mimetype, // The MIME type of the file
        ACL: 'public-read' // Make the file publicly readable
    };

    try {
        const data = await s3.upload(params).promise();
        return data.Location; // Return the URL of the uploaded image
    } catch (error) {
        console.error('Error uploading image:', error);
        throw new Error('Image upload failed');
    }
}

// Export the function for use in other modules
module.exports = { uploadImageToS3 };