const Card = require("../Models/Card");

exports.getAllCards = async (req, res) => {
  try {
    const cards = await card.find({});
    if (!cards || cards.length === 0) {
      return res.status(404).json({
        message: "No cards found",
        success: false,
      });
    }
    return res.status(200).json({
      message: "Cards fetched successfully",
      success: true,
      data: cards,
    });
  } catch (err) {
    console.error("Error fetching cards:", err);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: err.message,
    });
  }
};

exports.getSingleCard = async (req, res) => {
  try {
    const { cardId } = req.body;
    const cardDetails = await Card.findOne({
      _id: cardId,
    });
    if (!cardDetails) {
      return res.status(404).json({
        message: "Card not found",
        success: false,
      });
    }
    res.status(200).json({
      message: "Card fetched successfully",
      success: true,
      data: cardDetails,
    });
  } catch (err) {
    console.error("Error creating card:", err);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: err.message,
    });
  }
};
