const bcrypt = require("bcrypt");

const encryptPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

const decryptPassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

module.exports = { encryptPassword, decryptPassword };
