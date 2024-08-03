const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

// Set up multer storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'deity_images', // Folder name in Cloudinary for Deity images
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});

const upload = multer({ storage: storage });

// Function to upload image and return URL
const uploadImage = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath);
    console.log(result)
    return result.secure_url; // Return the secure URL of the uploaded image
  } catch (error) {
    throw new Error("Image upload failed: " + error.message);
  }
};

module.exports = { upload, uploadImage }; // Export the upload function and uploadImage