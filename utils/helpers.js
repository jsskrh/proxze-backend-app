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

module.exports = { hideChars, getAverageRating, sortDataByDate };
