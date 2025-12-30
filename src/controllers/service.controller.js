import Service from "../models/service.model.js";

export const createService = async (req, res) => {
  try {
    const { name, address, services } = req.body;

    if (!name || !address || !services || services.length === 0) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    const service = await Service.create({
      responderId: req.user.id,   // coming from auth middleware
      name,
      address,
      services
    });

    res.status(201).json({
      message: "Service created successfully",
      service
    });

  } catch (error) {
    res.status(500).json({
      message: "Error creating service",
      error: error.message
    });
  }
};

export const getMyService = async (req, res) => {
  try {
    const service = await Service.findOne({
      responderId: req.user.id
    });

    if (!service) {
      return res.status(200).json({
        service: null
      });
    }

    res.status(200).json({
      service
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch service"
    });
  }
};
