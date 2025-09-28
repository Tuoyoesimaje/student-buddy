const chrono = require('chrono-node');

/**
 * Parses a natural language string into a Date object.
 * @param {string} text - The natural language date/time string (e.g., "tomorrow at 5pm").
 * @returns {Date|null} - The parsed Date object or null if parsing fails.
 */
const parseNaturalDate = (text) => {
  if (!text || typeof text !== 'string') {
    return null;
  }

  // Using chrono-node to parse the date string
  const results = chrono.parseDate(text, new Date(), { forwardDate: true });

  return results;
};

module.exports = { parseNaturalDate };
