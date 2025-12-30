import mongoose from "mongoose";

const responderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      enum: ["medical", "security", "accident", "general"],
      required: true,
    },

    // ✅ LOCATION (NO DEFAULT TYPE)
    location: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: {
        type: [Number], // [lng, lat]
      },
    },
    role: {
      type: String,
      required: true,
    },
    socketId: {
      type: String,
      default: null,
    },

    isOnline: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// ✅ Geo index
responderSchema.index({ location: "2dsphere" });

export default mongoose.model("Responder", responderSchema);
