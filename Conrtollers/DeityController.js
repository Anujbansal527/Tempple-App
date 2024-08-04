const { uploadImageToS3 } = require("../MiddleWare/ImageUploadUsingAWS");
const Deity = require("../Models/DeityModel");
 
const createDeity = async (req, res) => {
  const { deityName, deityType, alternateName, description } = req.body; // Access other fields from req.body
  const imageFile = req.image; // Access the processed image from middleware
  const imageUrl = await uploadImageToS3(imageFile); // Upload image to S3

  if (!imageUrl) {
    return res.status(400).json({ message: "Image file is required" }); // Handle missing image file
  }
  
  const userId = req.user ? req.user._id : null; // Check if req.user is defined
  if (!userId) {
    return res.status(401).json({ message: "User not authenticated" }); // Handle unauthenticated user
  }
  
  try {
    const deity = new Deity({
      deityName,
      image: imageUrl, // Use uploaded image URL
      deityType,
      alternateName,
      description,
      panditId: userId,
    });
    const savedDeity = await deity.save();
    res.status(201).json(savedDeity);
  } catch (error) {
    res.status(400).json( error);
  }
};

const getAllDeities = async (req, res) => {
  try {
    const deities = await Deity.find();
    res.status(200).json(deities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDeityById = async (req, res) => {
  const { id } = req.params;
  try {
    const deity = await Deity.findById(id);
    if (!deity) return res.status(404).json({ message: "Deity not found" });
    res.status(200).json(deity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 

const updateDeity = async (req, res) => {
  const { id } = req.params;
  const { deityName, deityType, alternateName, description } = req.body; // Access other fields from req.body
  const imageFile = req.image; // Access the processed image from middleware
  const imageUrl = await uploadImageToS3(imageFile); // Upload image to S3

  if (imageUrl && !imageUrl.originalname) {
    return res.status(400).json({ message: "Invalid image file" }); // Handle invalid image file
  }
  try {
    const updatedDeity = await Deity.findByIdAndUpdate(
      id,
      {
        deityName,
        deityType,
        alternateName,
        description,
        image: imageUrl, // Use uploaded image URL
      },
      { new: true }
    );
    if (!updatedDeity) {
      return res.status(404).json({ message: "Deity not found" });
    }
    res.status(200).json(updatedDeity);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteDeity = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedDeity = await Deity.findByIdAndDelete(id);
    if (!deletedDeity)
      return res.status(404).json({ message: "Deity not found" });
    res.status(200).json({ message: "Deity deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDeityForPuja = async (req, res) => {
  const { deityId } = req.params;
  try {
    const deity = await Deity.findById(deityId).populate("pujas");
    if (!deity) return res.status(404).json({ message: "Deity not found" });
    res.status(200).json(deity.pujas || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createDeity,
  getAllDeities,
  getDeityById,
  updateDeity,
  deleteDeity,
  getDeityForPuja,
};