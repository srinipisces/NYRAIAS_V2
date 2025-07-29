// utils/date.js
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

// Extend once globally
dayjs.extend(utc);
dayjs.extend(timezone);

const TIMEZONE = 'Asia/Kolkata';

/**
 * Returns today's date in 'YYYY-MM-DD' based on Asia/Kolkata timezone
 */
function getKolkataDayString() {
  return dayjs().tz(TIMEZONE).format('YYYY-MM-DD');
}

/**
 * Format any Date object or ISO string to YYYY-MM-DD in Asia/Kolkata
 */
function formatToKolkataDay(date) {
  return dayjs(date).tz(TIMEZONE).format('YYYY-MM-DD');
}

module.exports = {
  getKolkataDayString,
  formatToKolkataDay,
};
