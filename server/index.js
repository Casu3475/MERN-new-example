import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import multer from "multer";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import { register } from "./controllers/auth.js";
import { createPost } from "./controllers/posts.js";
import { verifyToken } from "./middleware/auth.js";
import User from "./models/User.js";
import Post from "./models/Post.js";
import { users, posts } from "./data/index.js";

// CONFIGURATIONS MIDDLEWARE
const __filename = fileURLToPath(import.meta.url); // we can grab the file URL specifically when you use module
const __dirname = path.dirname(__filename); // only when you use a type module
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet()); // security middleware
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common")); // logging middleware
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors()); // allows us to make requests to our API from different origins
app.use("/assets", express.static(path.join(__dirname, "public/assets"))); // set the directory where we can find the static assets

// FILE STORAGE
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/assets");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

// ROUTES WITH FILES
app.post("/auth/register", upload.single("picture"), register);
app.post("/posts", verifyToken, upload.single("picture"), createPost);

// ROUTES USAGE
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);

// CONNECT TO MONGOOSE
// const PORT = process.env.PORT || 6001;
mongoose
  .connect(
    "mongodb+srv://" +
      process.env.DB_USER_PASS +
      "@casu.usuxxbd.mongodb.net/rom_db?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    app.listen(3001, () => console.log(`Connected to MongoDB on Port : 3001`));

    // ADD DATA ONE TIME
    // User.insertMany(users);
    // Post.insertMany(posts);
  })
  .catch((err) => console.log(`${err} Failed to connect to MongoDB`));
