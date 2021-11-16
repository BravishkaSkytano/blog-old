const htmlmin = require('html-minifier')
const slugify = require('@sindresorhus/slugify');
const moment = require('moment');
const readerBar = require('eleventy-plugin-reader-bar');
const emojiReadTime = require("@11tyrocks/eleventy-plugin-emoji-readtime");
const embedEverything = require("eleventy-plugin-embed-everything");
const excerpt = require("./src/excerpt");
const heroIcons = require('eleventy-plugin-heroicons');
const _ = require("lodash");
const getSimilarTags = function(tagsA, tagsB) {
  return tagsA.filter(Set.prototype.has, new Set(tagsB)).length;
}

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
  
  config.addPlugin(readerBar);

  config.addPlugin(emojiReadTime, {
    label: "min. to read",
    wpm: 300,
    bucketSize: 3,
  });

  config.addPlugin(embedEverything, {
    use: ['spotify', 'soundcloud', 'twitch']
  });

  config.addPlugin(heroIcons, {
    className: 'icon',
    errorOnMissing: true
  });

  config.addShortcode("excerpt", excerpt);

  config.addFilter('dateIso', date => {
    return moment(date).toISOString();
  });
 
  config.addFilter('dateReadable', date => {
    return moment(date).utc().format('LL'); // E.g. May 31, 2019
  });

  config.addFilter("slugify", slugify);

  config.addFilter("excerpt", (post) => {
    const content = post.replace(/(<([^>]+)>)/gi, "");
    return content.substr(0, content.lastIndexOf(" ", 350)) + "...";
  });

  config.addFilter("taglist", function(collection) {
    const tags = [];
    collection.forEach(post => {
        tags.push(...post.data.tags);
    });
    const sorted = [...new Set(tags)].sort((a, b) => a.localeCompare(b));
    return sorted;
  });

  config.addLiquidFilter("similarPosts", function(collection, path, tags){
    return collection.filter((post) => {
      return getSimilarTags(post.data.tags, tags) >= 1 && post.data.page.inputPath !== path;
    }).sort((a,b) => {
      return getSimilarTags(b.data.tags, tags) - getSimilarTags(a.data.tags, tags);
    });
  });

  config.addCollection("blog", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/posts/*.md").sort(function(a, b) {
      return b.date - a.date;
    });
  });

  config.addCollection("postsByYear", (collection) => {
    return _.chain(collection.getAllSorted())
      .groupBy((post) => post.date.getFullYear())
      .toPairs()
      .reverse()
      .value();
  });

  config.addCollection('books', function(collectionApi) {
    return collectionApi.getFilteredByGlob('./src/books/*.md').sort(function(a, b) {
      return b.date - a.date;
    });
  });

  config.addCollection('KaA', function(collectionApi) {
    return collectionApi.getFilteredByGlob('./src/books/kidnapped-and-afraid/*.md').sort(function(a, b) {
      return a.inputPath.localeCompare(b.inputPath);
    });
  });

  config.addCollection('TMF', function(collectionApi) {
    return collectionApi.getFilteredByGlob('./src/books/test-my-fire/*.md').sort(function(a, b) {
      return a.inputPath.localeCompare(b.inputPath);
    })
  });

  config.addCollection('DD', function(collectionApi) {
    return collectionApi.getFilteredByGlob('./src/books/dear-diary/*.md').sort(function(a, b) {
      return a.inputPath.localeCompare(b.inputPath);
    })
  });

  config.addCollection('PNPGFP', function(collectionApi) {
    return collectionApi.getFilteredByGlob('./src/books/past-nightmares-present-ghosts-future-peace/*.md').sort(function(a, b) {
      return a.inputPath.localeCompare(b.inputPath);
    })
  });

  config.addCollection('CoSaR', function(collectionApi) {
    return collectionApi.getFilteredByGlob('./src/books/court-of-shadows-and-ruin/*.md').sort((a, b) => {
      return a.inputPath.localeCompare(b.inputPath);
    })
  });

  config.addTransform('htmlmin', function (content, outputPath) {
    if (
      process.env.ELEVENTY_PRODUCTION &&
      outputPath &&
      outputPath.endsWith('.html')
    ) {
      let minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true,
        preserveLineBreaks: true,
      });
      return minified
    }

    return content
  })

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
