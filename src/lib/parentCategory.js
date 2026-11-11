export default function parentCategoryModified(category) {
  if (!category) {
    return '';
  }
  const categoryName = category
    .toLowerCase()
    .replace(/&/g, 'and') // Replace & with 'and' for better URL readability
    .split(' ')
    .join('-');

  return categoryName;
}
