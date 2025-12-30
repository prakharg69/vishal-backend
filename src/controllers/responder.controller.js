import Responder from "../models/Responder.model.js";

/* =========================
   UPDATE LOCATION
========================= */
export const updateLocation = async (req, res) => {
  try {
    const { latitude, longitude, address } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        message: "Latitude and longitude required"
      });
    }

    const responder = await Responder.findByIdAndUpdate(
      req.user.id,
      {
        location: {
          type: "Point",
          coordinates: [longitude, latitude] // IMPORTANT: [lng, lat]
        },
        address // optional, but useful
      },
      { new: true }
    );

    res.status(200).json({
      responder
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to update location"
    });
  }
};
