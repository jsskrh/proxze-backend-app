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

module.exports = { hideChars, getAverageRating };
