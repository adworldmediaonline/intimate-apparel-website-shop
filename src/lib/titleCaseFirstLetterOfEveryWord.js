// Function to convert text to title case (first letter of each word capitalized)
export const titleCaseFirstLetterOfEveryWord = str => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
