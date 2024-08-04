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

  res.status(200).json({ message: "OTP sent successfully" });
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

  res.status(200).json({ message: "OTP verified successfully" });
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

const updateProfile = async (req, res) => {
  const userId = req.user._id;
  const { personalInfo, userType, bankDetails, aadhaarCard, panCard, workDetails } = req.body;

  if (userType) {
    return res.status(400).json({ error: "Cannot update user role" });
  }

  try {
    const updateData = {};

    if (personalInfo) {
      const {
        fullName,
        surname,
        dob,
        gender,
        mobileNumber,
        email,
        profilePic,
        address,
        cityTownVillage,
        state,
        district,
        postalCode,
      } = personalInfo;

      if (fullName) {
        updateData["personalInfo.fullName"] = fullName;
      }
      if (surname) {
        updateData["personalInfo.surname"] = surname;
      }
      if (dob) {
        updateData["personalInfo.dob"] = dob;
      }
      if (gender) {
        updateData["personalInfo.gender"] = gender;
      }
      if (mobileNumber) {
        updateData["personalInfo.mobileNumber"] = mobileNumber;
      }
      if (email) {
        updateData["personalInfo.email"] = email;
      }
      if (profilePic) {
        const imageFile = req.image; // Access the processed image from middleware
        const imageUrl = await uploadImageToS3(imageFile); // Upload image to S3
        updateData["personalInfo.profilePic"] = imageUrl; // Update profilePic with imageUrl
      }
      if (address) {
        updateData["personalInfo.address"] = address;
      }
      if (cityTownVillage) {
        updateData["personalInfo.cityTownVillage"] = cityTownVillage;
      }
      if (state) {
        updateData["personalInfo.state"] = state;
      }
      if (district) {
        updateData["personalInfo.district"] = district;
      }
      if (postalCode) {
        updateData["personalInfo.postalCode"] = postalCode;
      }
    }

    if (bankDetails) {
      const { ifscCode, bankName, accountNumber, upiId } = bankDetails;
      if (ifscCode) {
        updateData["bankDetails.ifscCode"] = ifscCode;
      }
      if (bankName) {
        updateData["bankDetails.bankName"] = bankName;
      }
      if (accountNumber) {
        updateData["bankDetails.accountNumber"] = accountNumber;
      }
      if (upiId) {
        updateData["bankDetails.upiId"] = upiId;
      }
    }

    if (aadhaarCard) {
      const aadhaarImageFile = req.aadhaarCard; // Access the processed image from middleware
      const aadhaarImageUrl = await uploadImageToS3(aadhaarImageFile); // Upload image to S3
      updateData["identification.aadhaar"] = aadhaarImageUrl; // Update aadhaar with imageUrl
    }

    if (panCard) {
      const panImageFile = req.panCard; // Access the processed image from middleware
      const panImageUrl = await uploadImageToS3(panImageFile); // Upload image to S3
      updateData["identification.pan"] = panImageUrl; // Update pan with imageUrl
    }

    if (workDetails) {
      updateData["workDetails"] = workDetails;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res
      .status(200)
      .json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    res
      .status(400)
      .json({ error: "Failed to update profile", details: error.message });
  }
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

module.exports = {
  requestOTP,
  verifyOTP,
  register,
  subscribe,
  updateProfile,
  login,
  getUserProfile,
};