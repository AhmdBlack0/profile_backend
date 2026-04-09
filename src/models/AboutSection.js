import mongoose from "mongoose";

const skillSchema = new mongoose.Schema(
  {
    name: String,
    level: Number,
  },
  { _id: false }
);

const categorySchema = new mongoose.Schema(
  {
    title: String,
    color: String,
    skills: [skillSchema],
  },
  { _id: false }
);

const aboutSectionSchema = new mongoose.Schema(
  {
    heading: { type: String, default: "About Us" },
    description: { type: String, default: "" },
    categories: { type: [categorySchema], default: [] },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const AboutSection = mongoose.model("AboutSection", aboutSectionSchema);

export default AboutSection;
