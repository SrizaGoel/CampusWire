// profanity.js - wrapper around bad-words filter
const Filter = require('bad-words');
const filter = new Filter();

module.exports = {
  isProfane: (text) => {
    if (!text) return false;
    return filter.isProfane(text);
  },
  clean: (text) => {
    return filter.clean(text);
  }
};
