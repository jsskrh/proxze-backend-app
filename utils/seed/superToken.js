const { generateUniqueReferralToken } = require("../../controllers/users");
const User = require("../../models/user");

const assignSuperTokens = async () => {
  try {
    // Find all 'super-proxze' users without a referralToken
    const usersWithoutToken = await User.find({
      userType: "super-proxze",
      referralToken: { $exists: false },
    });

    // Iterate over each user and assign a unique referral token
    for (const user of usersWithoutToken) {
      const referralToken = await generateUniqueReferralToken();
      user.referralToken = referralToken;
      await user.save();
    }

    console.log(
      `Assigned referral tokens to ${usersWithoutToken.length} users.`
    );
  } catch (error) {
    console.error("Error assigning referral tokens:", error);
  }
};

module.exports = { assignSuperTokens };
