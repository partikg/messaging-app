const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

// Search users by name (besides yourself)
router.get("/", protect, async (req, res) => {
    const search = req.query.search || "";
    try {
        const users = await User.find({
            name: { $regex: search, $options: "i" },
            _id: { $ne: req.user._id }
        }).select("name email");
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;