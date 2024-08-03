const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    personalInfo: {
      fullName: { type: String, required: true },
      surname: { type: String, required: true },
      dob: { type: String, required: true },
      gender: { type: String, required: true },
      mobileNumber: { type: String, required: true, unique: true },
      email: { type: String },
      profilePic: { type: String },
      address: { type: String },
      cityTownVillage: { type: String },
      state: { type: String },
      district: { type: String },
      postalCode: { type: String },
    },
    userType: {
      type: String,
      enum: ["Devotee", "Pujari", "Temple Admin"],
      required: true,
    },
    referral: { type: String },
    referralCode: { type: String, unique: true },
    password: { type: String, required: true },
    workDetails: {
      type: {
        employmentType: {
          type: String,
          enum: ["Independent", "Temple", "Astrologer"],
        },
        language: { type: String },
        otherLanguages: [{ type: String }],
        pujariType: { type: String },
        pujaExpertise: [{ type: String }],
        astrologyExpertise: [{ type: String }],
        pujariRegion: { type: String },
        pujariCommunity: { type: String },
        vedaEducation: { type: String },
        education: { type: String },
        workingAt: { type: String },
        serviceType: {
          type: String,
          enum: ["Online", "Offline", "Other", "Home"],
        },
        willingToTravel: { type: Boolean },
      },
    },
    socialMedia: {
      facebook: { type: String },
      youtube: { type: String },
      instagram: { type: String },
    },
    aboutYou: { type: String },
    bankDetails: {
      ifscCode: { type: String },
      bankName: { type: String },
      accountNumber: { type: String },
      upiId: { type: String },
    },
    identification: {
      aadhaar: { type: String },
      pan: { type: String },
    },
    subscription: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
