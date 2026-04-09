import mongoose from "mongoose";

const navLinkSchema = new mongoose.Schema(
  {
    name: String,
    to: String,
  },
  { _id: false }
);

const socialSchema = new mongoose.Schema(
  {
    label: String,
    url: String,
  },
  { _id: false }
);

const siteSettingsSchema = new mongoose.Schema(
  {
    brandName: { type: String, default: "Script.team" },
    logoUrl: { type: String, default: "/logo.jpeg" },
    footerText: { type: String, default: "Built with React, Tailwind & Three.js" },
    navLinks: { type: [navLinkSchema], default: [] },
    socials: { type: [socialSchema], default: [] },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const SiteSettings = mongoose.model("SiteSettings", siteSettingsSchema);

export default SiteSettings;
