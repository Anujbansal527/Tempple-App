const Deity = require("../Models/DeityModel");
const { uploadImage } = require("../MiddleWare/ImageUpload")

const createDeity = async (req, res) => {
  const { deityName, deityType, alternateName, description, panditId } = req.body;
  const userId = req.user ? req.user._id : null; // Check if req.user is defined
  if (!userId) {
    return res.status(401).json({ message: "User not authenticated" }); // Handle unauthenticated user
  }
  try {
    let image = "default"; // Default image
    if (req.file) {
      image = await uploadImage(req.file.path); // Upload to Cloudinary
    }
    const deity = new Deity({
      deityName,
      image,
      deityType,
      alternateName,
      description,
      panditId: userId,
    });
    const savedDeity = await deity.save();
    res.status(201).json(savedDeity);
  } catch (error) {
    res.status(400).json({ message: error.message });
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
  try {
    let updatedImage = "default"; // Default image
    if (req.file) {
      updatedImage = await uploadImage(req.file.path); // Upload to Cloudinary
    }
    const updatedDeity = await Deity.findByIdAndUpdate(
      id,
      {
        // ... existing fields ...
        image: updatedImage, // Update image if provided
        // ... other fields ...
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