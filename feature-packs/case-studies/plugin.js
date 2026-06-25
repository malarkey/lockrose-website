const rssPlugin = require("@11ty/eleventy-plugin-rss");

function getCaseStudyOrder(item) {
  return Number(item.data.order || 0);
}

function getCaseStudyYear(item) {
  return Number(item.data.year || 0);
}

function getCaseStudySlug(item) {
  return String(item.data.slug || item.fileSlug || "")
    .trim();
}

function getCategorySlug(category) {
  return String(category || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function sortCaseStudies(left, right) {
  const orderCompare = getCaseStudyOrder(left) - getCaseStudyOrder(right);
  if (orderCompare !== 0) {
    return orderCompare;
  }

  const yearCompare = getCaseStudyYear(right) - getCaseStudyYear(left);
  if (yearCompare !== 0) {
    return yearCompare;
  }

  return (left.data.title || "").localeCompare(right.data.title || "");
}

module.exports = function caseStudiesFeature(eleventyConfig) {
  eleventyConfig.addPlugin(rssPlugin);

  eleventyConfig.addFilter("filterCaseStudiesByCategory", (items, category) => {
    return items.filter((item) => item.data.categories && item.data.categories.includes(category));
  });

  eleventyConfig.addFilter("selectCaseStudies", (items, selectedSlugs) => {
    if (!Array.isArray(items) || !Array.isArray(selectedSlugs)) {
      return [];
    }

    return selectedSlugs
      .filter(Boolean)
      .map((selectedSlug) => {
        return items.find((item) => getCaseStudySlug(item) === String(selectedSlug).trim());
      })
      .filter(Boolean);
  });

  eleventyConfig.addCollection("caseStudiesItems", (collection) => {
    return collection.getFilteredByGlob("./src/case-studies/*.md").sort(sortCaseStudies);
  });

  eleventyConfig.addCollection("featuredCaseStudies", (collection) => {
    return collection
      .getFilteredByGlob("./src/case-studies/*.md")
      .filter((item) => item.data.featured)
      .sort(sortCaseStudies);
  });

  eleventyConfig.addCollection("caseStudiesCategories", (collection) => {
    const categories = new Set();

    collection.getFilteredByGlob("./src/case-studies/*.md").forEach((item) => {
      if (item.data.categories) {
        item.data.categories.forEach((category) => categories.add(category));
      }
    });

    return Array.from(categories).sort();
  });

  eleventyConfig.addCollection("caseStudiesCategoryPages", (collection) => {
    const categories = new Set();

    collection.getFilteredByGlob("./src/case-studies/*.md").forEach((item) => {
      if (item.data.categories) {
        item.data.categories.forEach((category) => categories.add(category));
      }
    });

    return Array.from(categories)
      .sort()
      .map((category) => ({
        category,
        permalink: `/case-studies/category/${getCategorySlug(category)}/`,
        title: category
      }));
  });
};
