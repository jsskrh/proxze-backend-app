const axios = require("axios");
const Nin = require("../models/nin");
const User = require("../models/user");

const verifyNin = async (user) => {
  const newNin = await Nin.create({ nin: user.ninData.nin ?? user.nin.value });

  try {
    const { data } = await axios.post(
      "https://api.verified.africa/sfx-verify/v3/id-service/",
      {
        verificationType: "NIN-VERIFY",
        countryCode: "NG",
        searchParameter: newNin.nin,
        transactionReference: newNin._id,
      },
      {
        headers: {
          "Content-Type": "application/json",
          userid: process.env.VERIFIED_AFRICA_USERID,
          apiKey: process.env.VERIFIED_AFRICA_APIKEY,
        },
      }
    );

    const verificationStatus = data.verificationStatus;
    if (verificationStatus === "VERIFIED") {
      const {
        firstname,
        middlename,
        surname,
        photo,
        residence_AdressLine1,
        residence_AdressLine2,
        residence_Town,
        residence_lga,
        residence_postalcode,
        residence_state,
        trackingId,
        telephoneno,
        othername,
        maritalstatus,
        maidenname,
        email,
        gender,
        birthdate,
      } = data.response[0];
      await Nin.findByIdAndUpdate(newNin._id, {
        firstName: firstname,
        middleName: middlename,
        lastName: surname,
        otherName: othername,
        maidenName: maidenname,
        photo,
        email,
        gender,
        trackingId,
        phoneNumber: telephoneno,
        maritalStatus: maritalstatus,
        dateOfBirth: birthdate,
        "address.street1": residence_AdressLine1,
        "address.street2": residence_AdressLine2,
        "address.town": residence_Town,
        "address.lga": residence_lga,
        "address.postalcode": residence_postalcode,
        "address.state": residence_state,
      });
      await User.findByIdAndUpdate(user._id, {
        "ninData.isVerified": true,
        "ninData.data": newNin._id,
        "ninData.nin": newNin.nin,
      });
    }
    return;
  } catch (err) {
    console.log(err);
    return;
  }
};

module.exports = { verifyNin };
