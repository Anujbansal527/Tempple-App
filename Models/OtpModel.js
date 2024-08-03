const mongoose = require("mongoose");

const OtpSchema = new mongoose.Schema(
  {
  mobileNumber: { 
    type: String, 
    required: true, 
    unique: true 
  },
  userRole: { 
    type: String, 
    enum: ["Devotee", "Pujari", "Temple Admin"] 
  },
  otp: { 
    type: String, 
    required: true 
  },
  verified: { 
    type: Boolean, 
    default: false 
  },
  createdAt: { 
    type: Date, 
    default: Date.now, 
    expires: "10m" 
  }, 
});

module.exports = mongoose.model("Otp", OtpSchema);
