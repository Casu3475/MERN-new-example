import Post from "../models/Post.js";
import User from "../models/User.js";

/* CREATE */
// req.params is used to retrieve parameters in the URL of the request, while req.body is used to retrieve data sent in the body of the request.
export const createPost = async (req, res) => {
  try {
    const { userId, description, picturePath } = req.body;
    const user = await User.findById(userId);
    const newPost = new Post({
      userId,
      firstName: user.firstName,
      lastName: user.lastName,
      location: user.location,
      description,
      userPicturePath: user.picturePath,
      picturePath,
      likes: {},
      comments: [],
    });
    await newPost.save(); // save the new post to the database

    const post = await Post.find(); // find all the posts in the database
    res.status(201).json(post);
  } catch (err) {
    res.status(409).json({ message: err.message });
  }
};

/* READ */
export const getFeedPosts = async (req, res) => {
  try {
    const post = await Post.find(); // find all the posts in the database
    res.status(200).json(post);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params; // grab the id from the params
    const post = await Post.find({ userId }); // find all the posts in the database that match the userId
    res.status(200).json(post);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/* UPDATE */
export const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const post = await Post.findById(id); // find the post we need
    const isLiked = post.likes.get(userId); // check if the user has already liked the post

    if (isLiked) {
      post.likes.delete(userId); // if the user has already liked the post, we want to remove the like
    } else {
      post.likes.set(userId, true); // if the user has not liked the post, we want to add a like
    }

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { likes: post.likes },
      { new: true }
    );

    res.status(200).json(updatedPost);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
