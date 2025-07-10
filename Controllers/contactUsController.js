const Contact = require("../Models/Contact");

const createContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    const contact = new Contact({
      name,
      email,
      subject,
      message,
      user: req.user ? req.user._id : undefined, // agar authenticated user hai
    });

    await contact.save();

    res.status(201).json({
      success: true,
      message: "Contact message submitted successfully",
      data: contact,
    });
  } catch (error) {
    console.error("createContact error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while submitting contact message",
    });
  }
};

module.exports = createContact;
