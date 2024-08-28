const Subscription = require("../../models/business/subscription");

exports.createSubscription = async (req, res) => {
  const { type, duration, principalId, paymentRef, amount } = req.body;
  try {
    const existingSubscription = await Subscription.findOne({
      principalId,
    });
    if (existingSubscription) {
      await Subscription.deleteOne(existingSubscription);
    }

    const subscription = new Subscription({
      type,
      duration,
      principalId,
      paymentRef,
      amount,
    });
    await subscription.save();
    res.status(201).json(subscription);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOneAndUpdate(
      { principalId: req.params.id },
      req.body,
      { new: true }
    );
    res.json(subscription);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteSubscription = async (req, res) => {
  try {
    await Subscription.findOneAndDelete({ principalId: req.params.id });
    res.json({ message: "Subscription deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getSubscriptionByPrincipalId = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      principalId: req.params.id,
    });
    res.json(subscription);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAllSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find();
    res.json(subscriptions);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
