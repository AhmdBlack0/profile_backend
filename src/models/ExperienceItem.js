import mongoose from "mongoose";

const experienceItemSchema = new mongoose.Schema(
  {
    role: { type: String, required: true },
    company: { type: String, default: "" },
    location: { type: String, default: "" },
    period: { type: String, default: "" },
    description: { type: String, default: "" },
    color: { type: String, default: "#6366f1" },
    order: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const ExperienceItem = mongoose.model("ExperienceItem", experienceItemSchema);

export default ExperienceItem;
