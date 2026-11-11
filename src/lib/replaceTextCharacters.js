export const replaceTextCharacters = (
  text,
  charToReplace,
  replacementChar = ''
) => {
  if (!text) return '';
  if (typeof text !== 'string') return String(text);

  // Escape special characters for RegExp
  const escapedChar = charToReplace.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.replace(new RegExp(escapedChar, 'g'), replacementChar);
};

export const formatParenthesesText = text => {
  if (!text) return '';
  if (typeof text !== 'string') return String(text);

  // Match text inside parentheses and wrap it with bold tags while keeping the parentheses
  return text.replace(/\((.*?)\)/g, '(<strong>$1</strong>)');
};
