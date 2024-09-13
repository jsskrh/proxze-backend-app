const {
  generateUniqueReferralToken,
  generateUniquePhoneToken,
} = require("../../controllers/users");
const User = require("../../models/user");

const assignPhoneTokens = async () => {
  try {
    // Find all 'super-proxze' users without a referralToken
    const usersWithoutToken = await User.find({
      phoneToken: { $exists: false },
    });

    // Iterate over each user and assign a unique referral token
    for (const user of usersWithoutToken) {
      const phoneToken = await generateUniquePhoneToken();
      user.phoneToken = phoneToken;
      await user.save();
    }

    console.log(`Assigned phone tokens to ${usersWithoutToken.length} users.`);
  } catch (error) {
    console.error("Error assigning referral tokens:", error);
  }
};

module.exports = { assignPhoneTokens };
