const markdown = require('markdown-it');

module.exports = function excerpt(item) {
  const separator = '</p>';
  const excerpt = item.data?.page?.excerpt;

  // If it has an explicit excerpt (see setFrontMatterParsingOptions),
  // use it.
  if (excerpt) {
    return markdown({ html: true }).render(excerpt);
  }

  // If there's no explicit excerpt, use the first paragraph as the
  // excerpt. This is already parsed to HTML, so no need to use
  // markdown-it here
  const location = item.templateContent?.indexOf(separator);
  return location >= 0
    ? item.templateContent.slice(0, location + separator.length)
    : '';
};