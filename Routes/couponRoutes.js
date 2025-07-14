const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const { isAdmin, auth } = require('../Middleware/Auth');

// Admin Panel Routes
router.post('/admin/coupon',isAdmin, couponController.createCoupon);
router.put('/admin/coupon/:id',isAdmin, couponController.updateCoupon);
router.delete('/admin/coupon/:id',isAdmin, couponController.deleteCoupon);
router.get('/admin/coupons', couponController.getAllCoupons);
router.get('/admin/coupon/:id', couponController.getCouponById);

// Website Side Route
router.post('/apply-coupon',auth, couponController.applyCoupon); // user applies coupon code

module.exports = router;
