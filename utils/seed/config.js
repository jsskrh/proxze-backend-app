const BillingAlgorithm = require("../../models/billingAlgorithm");
const Config = require("../../models/config");

const config = {
  holdings: { total: 0.0, balance: 0.0 },
};

const configSeeder = async () => {
  await Config.deleteMany();
  await Config.insertMany(config);
};

module.exports = { configSeeder };
