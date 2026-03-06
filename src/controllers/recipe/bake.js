import { join } from "path";
import { runRecipe } from "../../models/recipe/bake.js";

export async function get(req, res) {
  const recipe = req.params.recipe;

  const __dirname = import.meta.dirname;
  if (__dirname === undefined)
    console.log("need node 20 or higher (and Express 5 or higher)");

  var dataPath = global.config.data.path || join(__dirname, "../../..");

  var directoryPath = join(dataPath, "examples", "json");
  var fileName = join(directoryPath, recipe);

  res.status(200).sendFile(fileName);
}

/**
 * POST /recipe/execute
 *
 * 'Bakes' a recipe by running each of its processes sequentially.
 * Each process is run through the engine, and terminal results are collected
 * into a content object keyed by process ID. Returns the aggregated results.
 */
async function fetchRecipe(uri, callback) {
  try {
    const response = await fetch(uri, {
      headers: { accept: "application/json" },
    });

    if (!response.ok) {
      const bodyText = await response.text().catch(() => "");
      return res.status(502).json({
        error: "Failed to fetch recipe document.",
        uri,
        status: response.status,
        statusText: response.statusText,
        body: bodyText.slice(0, 1000),
      });
    }

    return await response.json();
  } catch (err) {
    return res.status(502).json({
      error: "Error while fetching recipe document.",
      recipeUri,
      details: err instanceof Error ? err.message : String(err),
    });
  }
}

/**
 * POST /recipe/execute
 *
 * 'Bakes' a recipe by running each of its processes sequentially.
 * Each process is run through the engine, and terminal results are collected
 * into a content object keyed by process ID. Returns the aggregated results.
 */
export async function post(req, res) {
  const type = req.body?.type;
  const recipeUri = req.body?.recipe;

  var recipe = {};
  var variables = {};

  switch (type) {
    case "recipe":
      recipe = req.body;
      variables = req.body?.variables || {};
      break;
    case "recipe-ref":
      if (!recipeUri || typeof recipeUri !== "string") {
        return res.status(400).json({
          error:
            "Missing or invalid 'recipe' field. Expected a recipe URI string.",
        });
      }
      recipe = await fetchRecipe(recipeUri, function (err) {
        if (err) {
          res
            .status(err.httpCode)
            .json({ code: err.code, description: err.description });
          return;
        }
      });
      // first variables from request body, then from recipe document, default to empty object
      variables = req.body?.variables || recipe?.variables || {};
      break;
    default:
      return res.status(400).json({
        error: "Invalid recipe type.",
      });
  }

  if (!recipe || typeof recipe !== "object") {
    return res
      .status(400)
      .json({ error: "Recipe document is not a JSON object." });
  }

  const engine = req.app.locals.engine;

  await runRecipe(recipe, variables, engine, function (err, content) {
    if (err) {
      res
        .status(err.httpCode)
        .json({ code: err.code, description: err.description });
      return;
    }

    res.status(200).json(content);
  });
}
