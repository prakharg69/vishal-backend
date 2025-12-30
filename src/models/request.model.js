import mongoose from "mongoose";

const requestSchema = new mongoose.Schema(
  {
    // 👤 User who created request
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // 🚑 Assigned responder
    responderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Responder",
      required: true
    },

    // 🏥 Service (Hospital / Center)
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true
    },

    // 🆘 Category
    category: {
      type: String,
      enum: ["medical", "security", "accident"],
      required: true
    },

    // 📝 User message
    message: {
      type: String,
      required: true
    },

    // 📍 USER LOCATION (GeoJSON)
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true
      }
    },

    // 🔄 Request status
    status: {
      type: String,
      enum: ["pending", "replied"],
      default: "pending"
    },

    // 🧰 SERVICES PROVIDED BY RESPONDER
    servicesProvided: [
      {
        name: {
          type: String,
          required: true
        },
        quantity: {
          type: Number,
          required: true,
          min: 1
        }
      }
    ],

    // 💬 Responder reply message
    response: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

// ✅ Geo index
requestSchema.index({ location: "2dsphere" });

export default mongoose.model("Request", requestSchema);
