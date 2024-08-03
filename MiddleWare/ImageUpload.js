const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
}); 

// Function to upload image and return URL
const uploadImage = async (file) => {
  try {
    const result = await cloudinary.uploader.upload(file.path);
    console.log(result)
    return result.secure_url; // Return the secure URL of the uploaded image
  } catch (error) {
    throw new Error("Image upload failed: " + error.message);
  }
};

module.exports = { uploadImage }; // Export the uploadImage function