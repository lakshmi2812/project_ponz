let assignPoints = async function(user) {
  let points = 40;
  let level = 1;
  let referrer = await User.findById(user.parent);
  while (referrer !== undefined) {
    if (level === 1) {
      referrer.points = points;
    } else if (level > 1 && level <= 5) {
      referrer.points = Math.floor(points / 2);
      points = points / 2;
    } else {
      referrer.points = 1;
    }
    level++;
    user = referrer;
    referrer = await User.findById(user.parent);
  }
};

module.exports = assignPoints;
