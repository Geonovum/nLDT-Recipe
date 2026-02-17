export function get(req, res) {
  const content = {};
  content.title = "Recipe Reader API";
  content.description = "An OGC API compliant server for reading and processing recipes.";
  res.status(200).json(content);
}
