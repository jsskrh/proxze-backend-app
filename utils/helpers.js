const hideChars = (string) => {
  // Replace all but the first and last characters of the string with *
  var hiddenString =
    string.charAt(0) +
    string.slice(1, -2).replace(/./g, "*") +
    string.charAt(string.length - 2) +
    string.charAt(string.length - 1);

  // Return the string
  return hiddenString;
};

const getAverageRating = (reviews) => {
  if (!Array.isArray(reviews) || reviews.length === 0) {
    return 0;
  }

  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  const average = sum / reviews.length;

  return average;
};

const sortDataByDate = (data) => {
  // Define a custom comparison function
  function compareDates(a, b) {
    // Extract year and month from the objects
    const aYear = a.year;
    const bYear = b.year;
    const aMonth = new Date(Date.parse(a.month + " 1, 2000")).getMonth() + 1;
    const bMonth = new Date(Date.parse(b.month + " 1, 2000")).getMonth() + 1;

    // Compare years first
    if (aYear !== bYear) {
      return aYear - bYear;
    }

    // If years are the same, compare months
    return aMonth - bMonth;
  }

  // Sort the data using the custom comparison function
  data.sort(compareDates);

  return data;
};

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon1 - lon2);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

const escapeCommas = (value) => {
  if (typeof value === "string" && value.includes(",")) {
    return `"${value}"`;
  }
  return value;
};

const createUserLocationData = (users) => {
  const csvHeader = [
    "_id",
    "oplAddress_label",
    "oplAddress_placeId",
    "oplAddress_lga",
    "oplAddress_state",
    "oplAddress_coordinates",
    "resAddress_label",
    "resAddress_placeId",
    "resAddress_lga",
    "resAddress_state",
    "resAddress_coordinates",
  ].join(",");
  const csvRows = users.map((user) => {
    const oplCoordinates =
      user.oplAddress?.location?.coordinates?.join(";") || "";
    const resCoordinates =
      user.resAddress?.location?.coordinates?.join(";") || "";
    return [
      user._id || "",
      escapeCommas(user.oplAddress?.label || ""),
      user.oplAddress?.placeId || "",
      user.oplAddress?.lga || "",
      user.oplAddress?.state || "",
      oplCoordinates,
      escapeCommas(user.resAddress?.label || ""),
      user.resAddress?.placeId || "",
      user.resAddress?.lga || "",
      user.resAddress?.state || "",
      resCoordinates,
    ].join(",");
  });

  const csvContent = [csvHeader, ...csvRows].join("\n");

  return csvContent;
};

module.exports = {
  hideChars,
  getAverageRating,
  sortDataByDate,
  escapeCommas,
  createUserLocationData,
  getDistanceFromLatLonInKm,
};
