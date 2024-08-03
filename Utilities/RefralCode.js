function UniqueReferralCode() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let referralCode = "";
  for (let i = 0; i < 8; i++) {
    const randomChar = characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
    referralCode += randomChar;
    console.log(`Generated character at position ${i}: ${randomChar}`);
  }
  console.log(referralCode);
  return referralCode.toUpperCase();
}

console.log(UniqueReferralCode());

module.exports = { UniqueReferralCode };
