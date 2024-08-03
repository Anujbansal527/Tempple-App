const mongoose = require("mongoose");

const DeitySchema = new mongoose.Schema(
  {
    deityName: {
      type: String,
      required: true,
      unique: true,
    },
    image: {
      type: String,
      required: true,
    },
    deityType: {
      type: String,
      required: true,
      enum: ["God", "Goddess", "Other"],
    },
    alternateName: String,
    description: {
      type: String,
      required: true,
    },
    panditId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pandit",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Deity", DeitySchema);
