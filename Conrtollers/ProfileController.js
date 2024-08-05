const mongoose = require("mongoose");
const dotenv = require("dotenv");
  
const User = require("../Models/UserModel");
const Otp = require("../Models/OtpModel");
const Subscription = require("../Models/SubscriptionModel");

const { generateOTP, validateOTP } = require("../Utilities/otp");
const {
  encryptPassword,
  decryptPassword,
} = require("../Utilities/PasswordEncDec");
const { createToken, verifyToken } = require("../Utilities/AuthUsingJwt");
const { UniqueReferralCode } = require("../Utilities/RefralCode");

const USER_TYPES = ["Devotee", "Pujari", "Temple Admin"];

const isValidMobileNumber = (mobileNumber) => {
  return /^\d{10}$/.test(mobileNumber);
};

const requestOTP = async (req, res) => {
  const { mobileNumber, userRole } = req.body;

  if (!isValidMobileNumber(mobileNumber) || !USER_TYPES.includes(userRole)) {
    return res
      .status(400)
      .json({ error: "Invalid mobile number or user role" });
  }

  const otp = generateOTP(5);
  let otpDoc = await Otp.findOne({ mobileNumber });

  if (otpDoc) {
    otpDoc.userRole = userRole;
    otpDoc.otp = otp;
    await otpDoc.save();
  } else {
    otpDoc = new Otp({ mobileNumber, userRole, otp });
    await otpDoc.save();
  }

  res.status(200).json({ message: "OTP sent successfully",otp });
};

const verifyOTP = async (req, res) => {
  const { mobileNumber, otp } = req.body;
  console.log(otp);

  const otpDoc = await Otp.findOne({ mobileNumber });

  console.log(otpDoc);

  if (!otpDoc) {
    return res
      .status(400)
      .json({ error: "OTP not found for this mobile number" });
  }

  const storedOtp = otpDoc.otp;

  console.log(storedOtp);

  const isValid = await validateOTP(otp, storedOtp);

  if (!isValid) {
    return res.status(400).json({ error: "Invalid OTP" });
  }

  otpDoc.verified = true;

  await otpDoc.save();

  res.status(200).json({ message: "OTP verified successfully"});
};

const register = async (req, res) => {
  const { personalInfo, userType, referral, password, workDetails } = req.body;
  const { fullName, surname, dob, gender, mobileNumber } = personalInfo;

  if (!fullName || !surname || !dob || !gender) {
    return res
      .status(400)
      .json({ error: "Missing required personal information" });
  }

  if (!mobileNumber || !isValidMobileNumber(mobileNumber)) {
    return res.status(400).json({ error: "Invalid or missing mobile number" });
  }

  const otpDoc = await Otp.findOne({ mobileNumber });
  if (!otpDoc) {
    return res.status(400).json({ error: "Mobile number not found" });
  }

  const existingUser = await User.findOne({
    "personalInfo.mobileNumber": mobileNumber,
  });
  if (existingUser) {
    return res.status(400).json({ error: "User already exists" });
  }

  const referralCode = UniqueReferralCode();
  const encryptedPassword = await encryptPassword(password);

  const newUser = await User.create({
    personalInfo: {
      fullName,
      surname,
      dob,
      gender,
      mobileNumber,
    },
    userType,
    referral: referral || null, 
    referralCode,
    password: encryptedPassword,
    workDetails: userType === "Pujari" ? workDetails : null,
  });

  const token = createToken(newUser._id);

  res
    .status(201)
    .json({
      message: "User registered successfully",
      userId: newUser._id,
      token,
    });
};

const subscribe = async (req, res) => {
  const { plan, amount } = req.body;
  const userId = req.user._id;

  const user = await User.findById(userId);

  if (user.subscription) {
    return res.status(400).json({ error: "User is already subscribed" });
  }

  //will update and add payment gate ways

  await Subscription.create({
    userId,
    plan,
    amount,
    startDate: new Date(),
    endDate: new Date(
      Date.now() + (plan === "12" ? 365 : 180) * 24 * 60 * 60 * 1000
    ),
  });

  user.subscription = true;
  await user.save();

  res.status(200).json({ message: "Subscription successful" });
};

const login = async (req, res) => {
  const { mobileNumber, password, userType } = req.body;

  if (!mobileNumber || !password || !userType) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (!USER_TYPES.includes(userType)) {
    return res.status(400).json({ error: "Invalid user type" });
  }

  if (!isValidMobileNumber(mobileNumber)) {
    return res.status(400).json({ error: "Invalid mobile number" });
  }

  const user = await User.findOne({
    "personalInfo.mobileNumber": mobileNumber,
    userType,
  });
  if (!user) {
    return res.status(400).json({ error: "User not found" });
  }

  const isPasswordValid = await decryptPassword(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({ error: "Invalid password" });
  }

  const token = createToken(user._id);

  res.status(200).json({ message: "Login successful", token });
};

const getUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Failed to retrieve user profile",
        details: error.message,
      });
  }
};
const updateProfile = async (req, res) => {
  const { 
    personalInfo, 
    workDetails, 
    socialMedia, 
    aboutYou, 
    bankDetails, 
    identification 
  } = req.body;

  const userId = req.user._id;

  try {
    const user = await User.findById(userId); // Fetch user to get role

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update personalInfo if provided
    if (personalInfo) {
      if (personalInfo.fullName) user.personalInfo.fullName = personalInfo.fullName;
      if (personalInfo.surname) user.personalInfo.surname = personalInfo.surname;
      if (personalInfo.dob) user.personalInfo.dob = personalInfo.dob;
      if (personalInfo.gender) user.personalInfo.gender = personalInfo.gender;
      if (personalInfo.email) user.personalInfo.email = personalInfo.email;
      if (personalInfo.address) user.personalInfo.address = personalInfo.address;
      if (personalInfo.cityTownVillage) user.personalInfo.cityTownVillage = personalInfo.cityTownVillage;
      if (personalInfo.state) user.personalInfo.state = personalInfo.state;
      if (personalInfo.district) user.personalInfo.district = personalInfo.district;
      if (personalInfo.postalCode) user.personalInfo.postalCode = personalInfo.postalCode;
    }

    // Update workDetails if provided and user is Pujari
    if (user.userType === "Pujari" && workDetails) {
      if (workDetails.employmentType) user.workDetails.employmentType = workDetails.employmentType;
      if (workDetails.language) user.workDetails.language = workDetails.language;
      if (workDetails.otherLanguages) user.workDetails.otherLanguages = workDetails.otherLanguages;
      if (workDetails.pujariType) user.workDetails.pujariType = workDetails.pujariType;
      if (workDetails.pujaExpertise) user.workDetails.pujaExpertise = workDetails.pujaExpertise;
      if (workDetails.astrologyExpertise) user.workDetails.astrologyExpertise = workDetails.astrologyExpertise;
      if (workDetails.pujariRegion) user.workDetails.pujariRegion = workDetails.pujariRegion;
      if (workDetails.pujariCommunity) user.workDetails.pujariCommunity = workDetails.pujariCommunity;
      if (workDetails.vedaEducation) user.workDetails.vedaEducation = workDetails.vedaEducation;
      if (workDetails.education) user.workDetails.education = workDetails.education;
      if (workDetails.workingAt) user.workDetails.workingAt = workDetails.workingAt;
      if (workDetails.serviceType) user.workDetails.serviceType = workDetails.serviceType;
      if (workDetails.willingToTravel) user.workDetails.willingToTravel = workDetails.willingToTravel;
    }

    // Update socialMedia if provided
    if (socialMedia) {
      if (socialMedia.facebook) user.socialMedia.facebook = socialMedia.facebook;
      if (socialMedia.youtube) user.socialMedia.youtube = socialMedia.youtube;
      if (socialMedia.instagram) user.socialMedia.instagram = socialMedia.instagram;
    }

    // Update aboutYou if provided
    if (aboutYou) {
      user.aboutYou = aboutYou;
    }

    // Update bankDetails if provided
    if (bankDetails) {
      if (bankDetails.ifscCode) user.bankDetails.ifscCode = bankDetails.ifscCode;
      if (bankDetails.bankName) user.bankDetails.bankName = bankDetails.bankName;
      if (bankDetails.accountNumber) user.bankDetails.accountNumber = bankDetails.accountNumber;
      if (bankDetails.upiId) user.bankDetails.upiId = bankDetails.upiId;
    }

    // Update identification if provided
    if (identification) {
      if (typeof identification.aadhaar === 'string') {
        user.identification.aadhaar = identification.aadhaar;
      }
      if (typeof identification.pan === 'string') {
        user.identification.pan = identification.pan;
      }
    }

    // Handle file uploads for profilePic, aadhaar, and pan
    if (req.files) {
      if (req.files.profilePic) {
        const profilePicFile = req.files.profilePic;
        const profilePicUrl = await uploadImageToS3(profilePicFile);
        user.personalInfo.profilePic = profilePicUrl;
      }
      if (req.files.aadhaar && typeof identification.aadhaar !== 'string') {
        const aadhaarFile = req.files.aadhaar;
        const aadhaarUrl = await uploadImageToS3(aadhaarFile);
        user.identification.aadhaar = aadhaarUrl;
      }
      if (req.files.pan && typeof identification.pan !== 'string') {
        const panFile = req.files.pan;
        const panUrl = await uploadImageToS3(panFile);
        user.identification.pan = panUrl;
      }
    }

    await user.save();
    res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update profile", details: error.message });
  }
};

module.exports = {
  requestOTP,
  verifyOTP,
  register,
  subscribe,
  updateProfile,
  login,
  getUserProfile,
};
