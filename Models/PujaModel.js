const mongoose = require("mongoose");

const PujaSchema = new mongoose.Schema({
  pujaName: { type: String, required: true, unique: true },
  image: { type: String, required: true },
  godnames: [{ type: mongoose.Schema.Types.ObjectId, ref: "Deity" }],
  godType: { type: String, required: true },
  categories: [{ type: String }],
  pujaType: {
    type: String,
    enum: ["online", "offline", "home"],
    required: true,
  },
  purpose: String,
  packages: [
    {
      name: { type: String, enum: ["basic", "budget", "premium"] },
      cost: Number,
      pujaSamagriCost: Number,
      numberOfPandits: Number,
      duration: String,
    },
  ],
  dateTimeFrom: String,
  dateTimeTo: String,
  conductOn: [
    {
      type: String,
      enum: ["all", "mon", "tue", "wed", "thu", "fri", "sat", "sun"],
    },
  ],
  pujaSamagri: {
    flowers: [String],
    dryFruits: [String],
    wicks: [String],
    leaves: [String],
    clothes: [String],
  },
  description: String,
  additionalInfo: String,
  mulaMantram: String,
  pujaVidhanam: { type: String },
  panditId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Pandit",
    required: true,
  },
  status: {
    type: String,
    enum: ["upcoming", "waiting", "completed"],
    default: "upcoming",
  },
  events: { type: Boolean, default: false },
});

module.exports = mongoose.model("Puja", PujaSchema);
