import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import localizedFormat from 'dayjs/plugin/localizedFormat.js';

dayjs.extend(customParseFormat);
dayjs.extend(localizedFormat);

export function fromLDAPDate(dateString) {
  let date = dayjs(dateString, 'YYYYMMDDHHmmss[.0Z]');

  if (date.isValid()) return date.format('L LTS');
  else return null;
}

export function fromLDAPTimestamp(timestamp) {
  //UNIX timestamps start on year 1970, Windows timestamps have 100-nanosecond resolution and start on year 1601
  //Going the fast route - discarding the extra precision and going back 369 years...
  let date = dayjs(Math.floor(timestamp / 10_000)).subtract(369, 'year');

  if (date.isValid()) return date.format('L LTS');
  else return null;
}