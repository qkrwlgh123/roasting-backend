const { User } = require('../models');

const addUser = async (req, res) => {
  const userInfo = {
    username: req.body.username,
    profileImage: req.body.profileImage,
    profileDescription: req.body.profileDescription,
  };

  const user = await User.create(userInfo).catch((err) => console.log(err));
  res.status(200).send(user);
};

module.exports = {
  addUser,
};
