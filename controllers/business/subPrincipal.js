const User = require("../../models/user");
const Permission = require("../../models/business/permission");
const {
    sendSubPrincipalRegistrationMail,
  } = require("../../utils/mail");

  

const inviteSubprincipal = async (req, res) => {
    const { group, proxy, class: className, email } = req.body;
    try {
      const principal = await User.findOnebyId({ _id: req.user.id });
      const user = new User({
        email: email,
        userType: "sub-principal",
        agency: principal.agency,
        serviceOffered: principal.serviceOffered,
        areaOfOperation: principal.areaOfOperation,
        superPrincipal: principal._id,
      });
      const subPrincipal = await user.save();
      const permission = new Permission({
        group,
        proxy,
        class: Object.keys(className).filter((cls) => className[cls]),
        principalId: req.user.id,
        subPrincipalId: subPrincipal._id,
      });
      await permission.save();
  
      await sendSubPrincipalRegistrationMail(subPrincipal);
  
      res.status(201).json(permission);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
  
  module.exports = {
    inviteSubprincipal,
  };
  