import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.js";

// REGISTER
export const register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      picturePath,
      friends,
      location,
      occupation,
    } = req.body; // destructure the request body

    const salt = await bcrypt.genSalt(); // generate a salt
    const hashedPassword = await bcrypt.hash(password, salt); // hash the password

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      picturePath,
      friends,
      location,
      occupation,
      viewedProfile: Math.floor(Math.random() * 1000),
      impressions: Math.floor(Math.random() * 1000),
    }); // create a new user with the hashed password

    const savedUser = await newUser.save(); // save the user to the database
    res.status(201).json(savedUser); // send the user back to the client
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// LOGGIN IN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body; // destructure the request body
    const user = await User.findOne({ email }); // find the user in the database
    if (!user) return res.status(400).json({ msg: "User does not exist. " }); // if the user is not found, send a 404 error

    const isMatch = await bcrypt.compare(password, user.password); // compare the password with the hashed password
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials. " }); // if the password is not a match, send a 400 error

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET); // create a token
    delete user.password; // delete the password from the user object
    res.status(200).json({
      token,
      user,
    }); // send the token and the user back to the client
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
