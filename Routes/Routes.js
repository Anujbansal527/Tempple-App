const express = require("express");
const router = express.Router();
const multer = require('multer');
const uploadS3 = multer();

const { verifyToken } = require("../Utilities/AuthUsingJwt"); // Updated path

const { requestOTP, verifyOTP, register, login, subscribe, getUserProfile, updateProfile } = require("../Conrtollers/ProfileController")
const { createNewPuja, getAllpuja, getOnePuja, updatingPuja, deletingPuja, gettinUpComePuja, gettonWaitPuja, getCompletePuja, getTotalRev, getCompletedevents } = require("../Conrtollers/PujaController")
const { createDeity, getAllDeities, getDeityById, updateDeity, deleteDeity } = require("../Conrtollers/DeityController");

const { imageUploadMiddleware } = require("../MiddleWare/ImageUploadUsingAWS");

router.get("/", (req, res) => {
  res.send("<h1>Hey This Is Demo Page </h1>")
});

router.post("/request-otp", requestOTP);
router.post("/verify-otp", verifyOTP);
router.post("/register", register);
router.post("/login", login);

router.post("/subscribe", verifyToken, subscribe);
router.get("/profile", verifyToken, getUserProfile);
router.post("/update-profile", verifyToken, uploadS3.single('image'), imageUploadMiddleware , updateProfile);

router.post("/create-puja", verifyToken,uploadS3.single('image'), imageUploadMiddleware ,  createNewPuja);
router.get("/get-puja", verifyToken, getAllpuja);
router.get("/get-puja/:id", verifyToken, getOnePuja);
router.post("/update-puja/:id", verifyToken,uploadS3.single('image'), imageUploadMiddleware , updatingPuja);
router.delete("/delete-puja/:id", verifyToken, deletingPuja);

router.get("/upcoming-pujas", verifyToken, gettinUpComePuja); 
router.get("/waiting-pujas", verifyToken, gettonWaitPuja);
router.get("/completed-pujas", verifyToken, getCompletePuja);
router.get("/total-revenue", verifyToken, getTotalRev);
router.get("/completed-events", verifyToken, getCompletedevents);

router.post("/create-deity", verifyToken ,uploadS3.single('image'), imageUploadMiddleware , createDeity); 
router.get("/get-deity", getAllDeities);
router.get("/get-deity/:id", getDeityById);
router.post("/update-deity/:id", verifyToken, uploadS3.single('image'), imageUploadMiddleware , updateDeity);
router.delete("/delete-deity/:id", deleteDeity);

//router.get("/puja/get-deity/:deityId", getDeityForPuja);

module.exports = router;