const Puja = require("../Models/PujaModel");
const { uploadImage } = require("../MiddleWare/ImageUpload")

const createNewPuja = async (req, res) => {
  if (!req.user || !req.user._id) {
    return res.status(401).json({ message: "User ID not found" });
  }
 
  
  const userId = req.user._id;
  
  console.log(userId);
  
  const {
    pujaName,
    godnames, 
    godType,
    categories,
    pujaType,
    purpose,
    packages,
    dateTimeFrom,
    dateTimeTo,
    conductOn,
    pujaSamagri,
    description,
    additionalInfo,
    mulaMantram,
    pujaVidhanam,
  } = req.body;
  try {
    const imageFile = req.image; // Access the processed image from middleware
    const imageUrl = await uploadImageToS3(imageFile); // Upload image to S3
    if (!imageUrl) {
    return res.status(400).json({ message: "Image file is required" }); // Handle missing image file
  }
    const puja = new Puja({
      pujaName,
      image: imageUrl ? imageUrl : "no image",
      godnames, 
      godType,
      categories,
      pujaType,
      purpose,
      packages,
      dateTimeFrom,
      dateTimeTo,
      conductOn,
      pujaSamagri,
      description,
      additionalInfo,
      mulaMantram,
      pujaVidhanam,
      panditId: userId,
    });
    const savedPuja = await puja.save();
    res.status(201).json(savedPuja);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getAllpuja = async (req, res) => {
  const userId = req.user._id;
  try {
    const pujas = await Puja.find({ panditId: userId }).populate("godnames");
    res.status(200).json(pujas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOnePuja = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  try {
    const puja = await Puja.findOne({ _id: id, panditId: userId }).populate(
      "godnames"
    );
    if (!puja) return res.status(404).json({ message: "Puja not found" });
    res.status(200).json(puja);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updatingPuja = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  const {
    pujaName,
    godnames,
    godType,
    categories,
    pujaType,
    purpose,
    packages,
    dateTimeFrom,
    dateTimeTo,
    conductOn,
    pujaSamagri,
    description,
    additionalInfo,
    mulaMantram,
    pujaVidhanam,
    status,
  } = req.body;
  try {
    const imageFile = req.image; // Access the processed image from middleware
    const imageUrl = await uploadImageToS3(imageFile); // Upload image to S3
    const updatedPuja = await Puja.findByIdAndUpdate(
      id,
      {
        pujaName,
        image: imageUrl, // Update image if provided
        godnames, 
        godType,
        categories,
        pujaType,
        purpose,
        packages,
        dateTimeFrom,
        dateTimeTo,
        conductOn,
        pujaSamagri,
        description,
        additionalInfo,
        mulaMantram,
        pujaVidhanam,
        status,
        panditId: userId,
      },
      { new: true }
    );
    if (!updatedPuja)
      return res.status(404).json({ message: "Puja not found" });
    res.status(200).json(updatedPuja);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deletingPuja = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  try {
    const deletedPuja = await Puja.findOneAndDelete({
      _id: id,
      panditId: userId,
    });
    if (!deletedPuja)
      return res.status(404).json({ message: "Puja not found" });
    res.status(200).json({ message: "Puja deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const gettinUpComePuja = async (req, res) => {
  const userId = req.user._id;
  try {
    const upcomingPujas = await Puja.find({
      panditId: userId,
      status: "upcoming",
    }).sort({ date: 1 });
    const pujaCount = upcomingPujas.length;
    res.status(200).json({ pujas: upcomingPujas, count: pujaCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const gettonWaitPuja = async (req, res) => {
  const userId = req.user._id;
  try {
    const waitingPujas = await Puja.find({
      panditId: userId,
      status: "waiting",
    }).sort({ createdAt: 1 });
    const pujaCount = waitingPujas.length;
    res.status(200).json({ pujas: waitingPujas, count: pujaCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCompletePuja = async (req, res) => {
  const userId = req.user._id;
  try {
    const completedPujas = await Puja.find({
      panditId: userId,
      status: "completed",
    }).sort({ date: -1 });
    const pujaCount = completedPujas.length;
    res.status(200).json({ pujas: completedPujas, count: pujaCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTotalRev = async (req, res) => {
  const { startDate, endDate } = req.body;
  const userId = req.user._id;

  try {
    const revenue = await Puja.aggregate([
      {
        $match: {
          panditId: userId,
          status: "completed",
          date: { $gte: new Date(startDate), $lte: new Date(endDate) },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$price" },
          count: { $sum: 1 },
        },
      },
    ]);
    res.status(200).json(revenue[0] || { totalRevenue: 0, count: 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCompletedevents = async (req, res) => {
  const userId = req.user._id;
  try {
    const completedEvents = await Puja.find({
      panditId: userId,
      events: true,
    }).sort({ date: -1 });
    console.log(completedEvents);
    const eventCount = completedEvents.length;
    res.status(200).json({ events: completedEvents, count: eventCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createNewPuja,
  getAllpuja,
  getOnePuja,
  updatingPuja,
  deletingPuja,
  gettinUpComePuja,
  gettonWaitPuja,
  getCompletePuja,
  getTotalRev,
  getCompletedevents,
};
