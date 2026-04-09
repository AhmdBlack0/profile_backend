import mongoose from "mongoose";

const heroSectionSchema = new mongoose.Schema(
  {
    badgeText: { type: String, default: "Available for hire" },
    titlePrefix: { type: String, default: "Hi, We Are" },
    highlightedTitle: { type: String, default: "Script.team" },
    weAreLabel: { type: String, default: "We Are" },
    roles: { type: [String], default: ["Software Agency", "Tech Innovators"] },
    tagline: { type: String, default: "" },
    primaryButtonText: { type: String, default: "View Projects" },
    primaryButtonLink: { type: String, default: "/projects" },
    secondaryButtonText: { type: String, default: "Contact Us" },
    secondaryButtonLink: { type: String, default: "/contact" },
    stats: {
      type: [
        {
          value: String,
          label: String,
          subLabel: String,
        },
      ],
      default: [],
    },
    socialLinks: {
      type: [
        {
          label: String,
          url: String,
        },
      ],
      default: [],
    },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const HeroSection = mongoose.model("HeroSection", heroSectionSchema);

export default HeroSection;
