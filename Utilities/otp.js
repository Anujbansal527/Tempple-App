const generateOTP = (input) => {
  const length = input || 5;
  let generatedOtp = "";
  for (let i = 0; i < length; i++) {
    const randomDigit = Math.floor(Math.random() * 10);
    generatedOtp += randomDigit.toString();
  }
  console.log(generatedOtp);
  return generatedOtp;
};

const validateOTP = (inputOTP, storedOTP) => {
  console.log(storedOTP);
  return inputOTP === storedOTP;
};

module.exports = { generateOTP, validateOTP };
