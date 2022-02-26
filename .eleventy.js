const { DateTime } = require("luxon");
const htmlmin = require("html-minifier");
const slugify = require("@sindresorhus/slugify");
const moment = require("moment");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const readerBar = require("eleventy-plugin-reader-bar");
const emojiReadTime = require("@11tyrocks/eleventy-plugin-emoji-readtime");
const embedEverything = require("eleventy-plugin-embed-everything");
const heroIcons = require("eleventy-plugin-heroicons");

moment.locale("en");

module.exports = (config) => {
  const pluginTOC = require("eleventy-plugin-nesting-toc");
  config.addPlugin(pluginTOC, {
    tags: ["h2", "h3", "h4"], // Which heading tags are selected (headings must each have an ID attribute)
    ignoredElements: [], // Elements to ignore when constructing the label for every header (useful for ignoring permalinks, must be selectors)
    wrapper: "nav", // Element to put around the root `ol`
    wrapperClass: "", // Class for the element around the root `ol`
    //headingText: 'Table of Contents',      // Optional text to show in heading above the wrapper element
    //headingTag: 'p'      // Heading tag when showing heading above the wrapper element
  });

  // Example Markdown configuration (to add IDs to the headers)
  const markdownIt = require("markdown-it");
  const markdownItAnchor = require("markdown-it-anchor");
  const markdownItFootnote = require("markdown-it-footnote");
  config.setLibrary(
    "md",
    markdownIt({
      html: true,
      breaks: false,
      linkify: true,
      typographer: true,
    })
      .use(markdownItAnchor, {
        slugify: (s) => slugify(s),
      })
      .use(markdownItFootnote)
  );

  config.addPassthroughCopy("src/admin");
  config.addPassthroughCopy("src/assets");

  config.addPlugin(pluginRss);
  config.addPlugin(readerBar);
  config.addPlugin(emojiReadTime, {
    emoji: "⏳",
    label: "min. to read",
    wpm: 300,
    bucketSize: 3,
  });
  config.addPlugin(embedEverything, {
    use: ["youtube"], //, "spotify", "twitch", "soundcloud"],
    //twitch: {
    //autoplayChannels: false
    //},
    youtube: {
      options: {
        lite: true,
      },
    },
  });
  config.addPlugin(heroIcons, {
    className: "icon",
    errorOnMissing: true,
  });

  config.addFilter("readableDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat(
      "LLLL dd, yyyy"
    );
  });

  // https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
  config.addFilter("htmlDateString", (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: "est" }).toFormat("yyyy-LL-dd");
  });
  config.setFrontMatterParsingOptions({
    excerpt: true,
    excerpt_alias: "excerpt",
    excerpt_separator: "<!--excerpt-->",
  });
  config.addFilter("dateIso", (date) => {
    return moment(date).toISOString();
  });
  config.addFilter("dateReadable", (date) => {
    return moment(date).utc().format("LL"); // E.g. May 31, 2019
  });
  config.addFilter("slugify", slugify);

  config.addCollection("tagList", require("./src/getTagList"));

  config.addCollection("blog", function (collectionApi) {
    return collectionApi
      .getFilteredByGlob("src/posts/*.md")
      .sort(function (a, b) {
        return b.date - a.date;
      });
  });

  config.addCollection("characters", function (collectionApi) {
    return (
      collectionApi
        .getFilteredByGlob("src/characters/*.md")
        // Sort content alphabetically by `title`
        .sort((a, b) => {
          const titleA = a.data.title.toUpperCase();
          const titleB = b.data.title.toUpperCase();
          if (titleA > titleB) return 1;
          if (titleA < titleB) return -1;
          return 0;
        })
        // Sort content alphabetically by `category` (assuming `category` is a string like `Cat 1`)
        .sort((a, b) => {
          const categoryA = a.data.category.toUpperCase();
          const categoryB = b.data.category.toUpperCase();
          if (categoryA > categoryB) return 1;
          if (categoryA < categoryB) return -1;
          return 0;
        })
    );
  });

  config.addTransform("htmlmin", function (content, outputPath) {
    if (
      process.env.ELEVENTY_PRODUCTION &&
      outputPath &&
      outputPath.endsWith(".html")
    ) {
      let minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true,
        preserveLineBreaks: true,
      });
      return minified;
    }

    return content;
  });

  return {
    markdownTemplateEngine: "njk",
    dataTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dir: {
      input: "src",
      output: "_site",
    },
  };
};
