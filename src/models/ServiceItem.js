import mongoose from "mongoose";

const serviceItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, default: "Globe" },
    accent: { type: String, default: "#6366f1" },
    order: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const ServiceItem = mongoose.model("ServiceItem", serviceItemSchema);

export default ServiceItem;
