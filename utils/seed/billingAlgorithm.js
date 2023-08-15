const BillingAlgorithm = require("../../models/billingAlgorithm");

const settings = {
  locationClass: [
    { level: "high", value: 2 },
    { level: "mid", value: 1.5 },
    { level: "low", value: 1 },
  ],

  educationLevel: [
    { level: "FSCL", value: 1 },
    { level: "SSCE", value: 1.2 },
    { level: "OND", value: 1.4 },
    { level: "HND/BSc", value: 1.6 },
    { level: "MSc/MBA", value: 1.8 },
    { level: "PhD", value: 2 },
  ],

  certification: [
    { type: "Yes", value: 1.5 },
    { type: "No", value: 1 },
  ],

  yearsOfExperience: [
    { range: "1-3 years", value: 1 },
    { range: "4-6 years", value: 1.2 },
    { range: "7-9 years", value: 1.4 },
    { range: "10 years & above", value: 1.6 },
  ],

  skillLevel: [
    { level: "Skilled", value: 1.5 },
    { level: "Unskilled", value: 1 },
  ],

  searchRange: [
    { range: "None", value: 1 },
    { range: "25 Kilometers", value: 1.5 },
    { range: "50 Kilometers", value: 2 },
    { range: "100 Kilometers", value: 2.5 },
    { range: "Wards", value: 3 },
    { range: "LGA", value: 3.5 },
    { range: "State", value: 4 },
    { range: "Country", value: 4.5 },
  ],

  timeBlock: {
    periods: [
      { period: "Day", value: 1 },
      { period: "Night", value: 1.5 },
    ],
    hoursPerPeriod: 12,
    dayStartTime: "8:00",
    nightStartTime: "20:00",
  },
};

const billingAlgorithmSeeder = async () => {
  await BillingAlgorithm.deleteMany();
  await BillingAlgorithm.insertMany(settings);
};

module.exports = { billingAlgorithmSeeder };
