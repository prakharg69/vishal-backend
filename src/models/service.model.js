import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    responderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Responder",
      required: true
    },

    name: {
      type: String,
      required: true
    },

    address: {
      type: String,
      required: true
    },

    // custom services (dynamic)
    services: [
      {
        name: {
          type: String,
          required: true
        },
        quantity: {
          type: Number,
          required: true,
          min: 0
        }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("Service", serviceSchema);
