const moment = require('moment');
const readerBar = require('eleventy-plugin-reader-bar')
const emojiReadTime = require("@11tyrocks/eleventy-plugin-emoji-readtime");
const embedEverything = require("eleventy-plugin-embed-everything");
const heroIcons = require('eleventy-plugin-heroicons');

moment.locale('en')

module.exports = config => {

  config.addPlugin(readerBar);
  config.addPlugin(emojiReadTime, {
    label: "min. to read",
    wpm: 300,
    bucketSize: 3,
  });
  config.addPlugin(embedEverything, {
    use: ['spotify', 'vimeo', 'youtube', 'soundcloud']
  });
  config.addPlugin(heroIcons, {
    className: 'h-10 w-10',
    errorOnMissing: true
  });

  config.addPassthroughCopy("src/blog/assets");

  config.addFilter('dateIso', date => {
    return moment(date).toISOString();
  });
 
  config.addFilter('dateReadable', date => {
    return moment(date).utc().format('LL'); // E.g. May 31, 2019
  });

  return {
    markdownTemplateEngine: 'njk',
    dataTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',
    dir: {
      input: 'src',
      output: '_site'
    }
  };
};
