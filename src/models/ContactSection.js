import mongoose from "mongoose";

const contactInfoSchema = new mongoose.Schema(
  {
    label: String,
    value: String,
    href: String,
    color: String,
    /** "email" | "phone" | "location" | "" (auto from label) */
    iconType: { type: String, default: "" },
  },
  { _id: false }
);

const contactSectionSchema = new mongoose.Schema(
  {
    heading: { type: String, default: "Let's Connect" },
    intro: { type: String, default: "" },
    contactInfo: { type: [contactInfoSchema], default: [] },
    formNameLabel: { type: String, default: "Your Name" },
    formNamePlaceholder: { type: String, default: "John Doe" },
    formEmailLabel: { type: String, default: "Your Email" },
    formEmailPlaceholder: { type: String, default: "john@example.com" },
    formSubjectLabel: { type: String, default: "Subject" },
    formSubjectPlaceholder: { type: String, default: "How can I help?" },
    formMessageLabel: { type: String, default: "Message" },
    formMessagePlaceholder: { type: String, default: "Drop your message here..." },
    formSubmitText: { type: String, default: "Send Message" },
    formSendingText: { type: String, default: "Sending..." },
    formSuccessTitle: { type: String, default: "Message Sent!" },
    formSuccessMessage: {
      type: String,
      default: "Thanks for reaching out. I'll get back to you within 24 hours.",
    },
    formSuccessButtonText: { type: String, default: "Send another" },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const ContactSection = mongoose.model("ContactSection", contactSectionSchema);

export default ContactSection;
