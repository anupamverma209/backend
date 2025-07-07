const Cart = require("../models/Card");
const Product = require("../Models/Product"); // agar price Product se lena hai
const mongoose = require("mongoose");

// controllers/cartController.js

exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.id;

    if (!productId || !quantity) {
      return res
        .status(400)
        .json({ message: "Product ID and quantity are required." });
    }

    // check product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    // find user cart
    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      // first time cart create
      cart = new Cart({
        user: userId,
        cartItems: [
          {
            product: productId,
            quantity,
            price: product.price,
          },
        ],
        totalItems: 1,
        totalPrice: product.price * quantity,
      });
    } else {
      // cart exists
      const itemIndex = cart.cartItems.findIndex(
        (item) => item.product.toString() === productId
      );

      if (itemIndex > -1) {
        // product already in cart -> quantity overwrite
        cart.cartItems[itemIndex].quantity = quantity;
      } else {
        // product not in cart -> push
        cart.cartItems.push({
          product: productId,
          quantity,
          price: product.price,
        });
      }

      // recalculate totals
      cart.totalItems = cart.cartItems.length;
      cart.totalPrice = cart.cartItems.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );
    }

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Product added to cart successfully.",
      cart,
    });
  } catch (error) {
    console.error("addToCart error =>", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong.",
      error: error.message,
    });
  }
};

// controllers/cartController.js

exports.getCart = async (req, res) => {
  try {
    const userId = req.user._id; // maan ke chalta hoon ki aapka auth middleware yeh set karta hai

    const cart = await Cart.findOne({ user: userId }).populate({
      path: "cartItems.product",
      select: "title price images", // jo fields aapko dikhani ho
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    res.status(200).json({
      success: true,
      cart: {
        cartItems: cart.cartItems,
        totalPrice: cart.totalPrice,
        totalItems: cart.totalItems,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

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
