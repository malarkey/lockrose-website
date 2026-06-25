function getServiceOrder(item) {
  return Number(item.data.order || 0);
}

function sortServices(left, right) {
  const orderCompare = getServiceOrder(left) - getServiceOrder(right);
  if (orderCompare !== 0) {
    return orderCompare;
  }

  return (left.data.title || "").localeCompare(right.data.title || "");
}

module.exports = function servicesFeature(eleventyConfig) {
  eleventyConfig.addCollection("servicesItems", (collection) => {
    return collection.getFilteredByGlob("./src/services/*.md").sort(sortServices);
  });

  eleventyConfig.addCollection("featuredServices", (collection) => {
    return collection
      .getFilteredByGlob("./src/services/*.md")
      .filter((item) => item.data.featured)
      .sort(sortServices);
  });
};
