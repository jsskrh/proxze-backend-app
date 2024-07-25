const Subscription = require("../../models/business/subscription");

exports.createSubscription = async (req, res) => {
  const { type } = req.body;
  try {
    const subscription = new Subscription({ type });
    await subscription.save();
    res.status(201).json(subscription);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findByIdAndUpdate(
      req.params.id,
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
    await Subscription.findByIdAndDelete(req.params.id);
    res.json({ message: "Subscription deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getSubscriptionById = async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);
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
