const User = require("../../models/user");
const { sendVerificationMail } = require("../mail");
const { verifyNin } = require("../nin");

const verificationSeeder = async () => {
  const withUnverifiedEmail = await User.find({ isVerified: false });
  // for (const user of withUnverifiedEmail) {
  //   await sendVerificationMail(user);
  // }
  console.log("withUnverifiedEmail", withUnverifiedEmail);

  const withUnverifiedNin = await User.find({
    $or: [
      { "nin.isVerified": false },
      { "nin.isVerified": { $exists: false } },
    ],
  });
  // for (const user of withUnverifiedNin) {
  //   await verifyNin(user);
  // }
  console.log("withUnverifiedNin", withUnverifiedNin);

  return { withUnverifiedEmail, withUnverifiedNin };
};

module.exports = { verificationSeeder };
