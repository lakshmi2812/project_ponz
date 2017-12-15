const User = require("./models/User");
let assignPoints = async function(user) {
  let _points = 40;
  let level = 1;
  let distance = 1;
  let referrer = await User.findById(user.parent);
  while (referrer !== null) {
    if (level === 1) {
      await User.update({ _id: referrer._id }, { $inc: { points: 40 } });
    } else if (level > 1 && level <= 5) {
      await User.update(
        { _id: referrer._id },
        { $inc: { points: Math.floor(_points / 2) } }
      );
      _points = _points / 2;
    } else {
      await User.update({ _id: referrer._id }, { $inc: { points: 1 } });
    }
    level++;
    user = referrer;
    referrer = await User.findById(user.parent);
  }
};

module.exports = assignPoints;
