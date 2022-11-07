const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User.model");

/**
 * @desc Register a new user
 * @route /api/users
 * @access Public 
 */
const registerUser = asyncHandler(async(req, res) => {
    const {name, email, password} = req.body;

    // Validation
    if(!name || !email || !password) {
        res.status(400);
        throw new Error('Please include all fields')
    }

    // Find if user already exists in database
    const userExists = await User.findOne({email});

    if(userExists) {
        res.status(400);
        throw new Error("User already exists");
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
        name,
        email,
        password: hashedPassword
    });

    if(user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id)
        }).status(201);
    } else {
        res.status(400);
        throw new Error("Invalid user data");
    }
});

/**
 * @desc Login a user
 * @route /api/users/login
 * @access Public 
 */
const loginUser = asyncHandler(async(req, res) => {
    const {email, password} = req.body;

    const user = await User.findOne({email});

    // Check user and passwords match
    if(user && (await bcrypt.compare(password, user.password))){
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id)
        }).status(200);
    } else {
        res.status(401);
        throw new Error("Invalid credentials");
    }

    
});

// Generate token
const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
}

module.exports = {
    registerUser,
    loginUser
}