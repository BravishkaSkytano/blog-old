const { DateTime } = require("luxon");
const htmlmin = require('html-minifier')
const slugify = require('@sindresorhus/slugify');
const moment = require('moment');
const pluginRss = require("@11ty/eleventy-plugin-rss");
const readerBar = require('eleventy-plugin-reader-bar');
const emojiReadTime = require("@11tyrocks/eleventy-plugin-emoji-readtime");
const embedEverything = require("eleventy-plugin-embed-everything");
const excerpt = require("./src/excerpt");
const heroIcons = require('eleventy-plugin-heroicons');

const fs = require("fs");
const crypto = require("crypto");
const scrape = require('html-metadata');
const path = require('path');
const escape = (unsafe) => {
  return (unsafe === null) ? null : 
    unsafe.replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
}

const linkPreview = (link, callback) => {

  // Helper function to format links
  const format = (metadata) => {
    let domain = link.replace(/^http[s]?:\/\/([^\/]+).*$/i, '$1');
    let title = escape((metadata.openGraph ? metadata.openGraph.title : null) || metadata.general.title || "");
    let author = escape(((metadata.jsonLd && metadata.jsonLd.author) ? metadata.jsonLd.author.name : null) || "");
    let image = escape((metadata.openGraph && metadata.openGraph.image) ? (Array.isArray(metadata.openGraph.image) ? metadata.openGraph.image[0].url : metadata.openGraph.image.url) : null);
    let description = escape(((metadata.openGraph ? metadata.openGraph.description : "") || metadata.general.description || "").trim());
    
    if (description.length > 140) {
      description = description.replace(/^(.{0,140})\s.*$/s, '$1') + '…';
    }
    
    return  `<p class="not-prose callout"><a class="cover-img" href="${link}">` +
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 67.733 67.733"><path fill="#d0d0d0" d="M0 0h67.733v67.733H0z"/><path fill="#fff" d="M33.867 13.547a20.32 20.32 0 00-20.32 20.32 20.32 20.32 0 0020.32 20.32 20.32 20.32 0 0020.32-20.32H50.8A16.933 16.933 0 0133.867 50.8a16.933 16.933 0 01-16.934-16.933 16.933 16.933 0 0116.934-16.934z"/><path fill="#fff" d="M26.383 36.361l4.99 4.99 19.955-19.957 4.99 4.99V11.415H41.35l4.99 4.99L26.382 36.36"/></svg>' +
            (image ? `<img src="data:image/png;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" data-src="${image}" alt="${title}">` : '') +
//          Use the below line without lazy loading
//          (image ? `<img src="${image}" alt="${title}">` : '') +
            `</a><a class="meta" href="${link}"><strong class="meta-title">${title}<br></strong><em class="meta-desc">${description}</em>` +
            (author ? `<span class="meta-author">${author}</span>` : ``)+
            `<span class="meta-dom">${domain}</span></a></p>`.replace(/[\n\r]/g, ' ');
  }
  
  // Hash the link URL (using SHA1) and create a file name from it
  let hash = crypto.createHash('sha1').update(link).digest('hex');
  let file = path.join('_links', `${hash}.json`);

  if (fs.existsSync(file)) {
    // File with cached metadata exists
    console.log(`[linkPreview] Using persisted data for link ${link}.`);
    fs.readFile(file, (err, data) => {
      if (err) callback("Reading persisted metadata failed", `<div style="color:#ff0000; font-weight:bold">ERROR: Reading persisted metadata failed</div>`);
      // Parse file as JSON, pass it to the format function to format the link
      callback(null, format(JSON.parse(data.toString('utf-8'))));
    });
  } else {
    // No cached metadata exists
    console.log(`[linkPreview] No persisted data for ${link}, scraping.`);
    scrape(link).then((metadata => {
      if (!metadata) callback ("No metadata", `<div style="color:#ff0000; font-weight:bold">ERROR: Did not receive metadata</div>`);
      // First, store the metadata returned by scrape in the file
      fs.writeFile(file, JSON.stringify(metadata, null, 2), (err) => { /* Ignore errors, worst case we parse the link again */ });
      // Then, format the link
      callback(null, format(metadata)); 
    }));
  }  
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

  config.addPassthroughCopy("src/admin");
  config.addPassthroughCopy("src/assets");
  
  config.addPlugin(pluginRss);
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

  config.addFilter("readableDate", dateObj => {
    return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat("LLLL dd, yyyy");
  });

  // https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
  config.addFilter('htmlDateString', (dateObj) => {
    return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat('yyyy-LL-dd');
  });

  config.setFrontMatterParsingOptions({
    excerpt: true,
    excerpt_separator: '<!-- excerpt -->'
  });

  config.addShortcode('excerpt', (post) => {
    return excerpt(post);
  });

  config.addNunjucksAsyncFilter("linkPreview", linkPreview);

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

  config.addCollection("tagList", require("./src/getTagList"));

  config.addCollection("blog", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/posts/*.md").sort(function(a, b) {
      return b.date - a.date;
    });
  });

  config.addCollection('books', function(collectionApi) {
    return collectionApi.getFilteredByGlob('./src/books/*.md').sort(function(a, b) {
      return b.date - a.date;
    });
  });

  config.addCollection('characters', function(collectionApi) {
    return collectionApi.getFilteredByGlob('./src/books/characters/*.md').sort(function(a, b) {
      return a.inputPath.localeCompare(b.inputPath);
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
