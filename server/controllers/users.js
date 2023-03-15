import User from "../models/User.js";

/* READ */
export const getUser = async (req, res) => {
  try {
    const { id } = req.params; // grab the id from the params
    const user = await User.findById(id); // use the id to grab the information of the user we need
    res.status(200).json(user); // we send back to the front-end
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getUserFriends = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    const friends = await Promise.all(
      user.friends.map((id) => User.findById(id))
    ); // we use Promise.all to make multiple API call to the database

    const formattedFriends = friends.map(
      ({ _id, firstName, lastName, occupation, location, picturePath }) => {
        return { _id, firstName, lastName, occupation, location, picturePath };
      }
    ); // we make sure that we format this in a proper way for the front end
    res.status(200).json(formattedFriends);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/* UPDATE */
export const addRemoveFriend = async (req, res) => {
  try {
    const { id, friendId } = req.params; // grab the id from the params
    const user = await User.findById(id); // grab the user we need
    const friend = await User.findById(friendId); // grab the friend

    if (user.friends.includes(friendId)) {
      user.friends = user.friends.filter((id) => id !== friendId); // if the friend ID is already part of the main users friendslist, we want them to be removed
      friend.friends = friend.friends.filter((id) => id !== id); // we also want to remove the main user from the friends friendslist
    } else {
      user.friends.push(friendId); // if the friend ID is not part of the main users friendslist, we want them to be added
      friend.friends.push(id);
    }
    await user.save();
    await friend.save();

    const friends = await Promise.all(
      user.friends.map((id) => User.findById(id))
    );
    const formattedFriends = friends.map(
      ({ _id, firstName, lastName, occupation, location, picturePath }) => {
        return { _id, firstName, lastName, occupation, location, picturePath };
      }
    );

    res.status(200).json(formattedFriends);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
