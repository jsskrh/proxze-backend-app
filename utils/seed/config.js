const BillingAlgorithm = require("../../models/billingAlgorithm");
const Config = require("../../models/config");
const System = require("../../models/system");

const config = {
  holdings: { total: 0.0, balance: 0.0 },
};

const configSeeder = async () => {
  const system = await System.findOne();
  if (!system) {
    await System.create({ balance: 0 });
  }
};

module.exports = { configSeeder };
