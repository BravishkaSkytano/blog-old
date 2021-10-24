const slugify = require('@sindresorhus/slugify');
const moment = require('moment');
const readerBar = require('eleventy-plugin-reader-bar');
const emojiReadTime = require("@11tyrocks/eleventy-plugin-emoji-readtime");
const embedEverything = require("eleventy-plugin-embed-everything");
const heroIcons = require('eleventy-plugin-heroicons');
const _ = require("lodash");

moment.locale('en')

module.exports = config => {

  const pluginTOC = require('eleventy-plugin-nesting-toc');
  config.addPlugin(pluginTOC, {
    tags: ['h2', 'h3', 'h4'], // Which heading tags are selected (headings must each have an ID attribute)
    ignoredElements: [],  // Elements to ignore when constructing the label for every header (useful for ignoring permalinks, must be selectors)
    wrapper: 'nav',       // Element to put around the root `ol`
    wrapperClass: '',  // Class for the element around the root `ol`
    headingText: 'Table of Contents',      // Optional text to show in heading above the wrapper element
    headingTag: 'p'      // Heading tag when showing heading above the wrapper element
  });

  // Example Markdown configuration (to add IDs to the headers)
  const markdownIt = require('markdown-it');
  const markdownItAnchor = require('markdown-it-anchor');
  config.setLibrary("md",
      markdownIt({
          html: true,
          linkify: true,
          typographer: true,
      })
      .use(markdownItAnchor, {
        slugify: s => slugify(s)
      })
  );

  config.addPassthroughCopy("src/assets");
  config.addPassthroughCopy("src/admin");
  
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
    className: 'icon',
    errorOnMissing: true
  });

  config.addFilter('dateIso', date => {
    return moment(date).toISOString();
  });
 
  config.addFilter('dateReadable', date => {
    return moment(date).utc().format('LL'); // E.g. May 31, 2019
  });

  config.addFilter("slugify", slugify);

  config.addCollection('blog', collection => {
    return [...collection.getFilteredByGlob('./src/posts/**/*.md')].reverse();
  });

  config.addCollection("postsByYear", (collection) => {
    return _.chain(collection.getAllSorted())
      .groupBy((post) => post.date.getFullYear())
      .toPairs()
      .reverse()
      .value();
  });
  
  config.addCollection('tagsList', (collectionApi) => {
    const tagsSet = new Set()
    collectionApi.getAll().forEach((item) => {
      if (!item.data.tags) return
      item.data.tags
        .filter((tag) => !['all', 'blog'].includes(tag))
        .forEach((tag) => tagsSet.add(tag))
    })
    return [...tagsSet].sort((a, b) => b.localeCompare(a))
  })

  config.addCollection('books', collection => {
    return [...collection.getFilteredByGlob('./src/books/**/*.md')];
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
