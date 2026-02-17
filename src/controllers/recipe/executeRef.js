import fetch from "node-fetch";

import { runRecipe } from "../../models/recipe/execute.js";

/**
 * POST /recipe/execute
 *
 * Executes a recipe by running each of its processes sequentially.
 * Each process is run through the engine, and terminal results are collected
 * into a content object keyed by process ID. Returns the aggregated results.
 */
export async function post(req, res) {
  const type = req.body?.type;
  const recipeUri = req.body?.recipe;
  const feature = req.body?.feature; // reserved for future use

  if (type !== "recipe-ref") {
    return res
      .status(400)
      .json({ error: "Invalid recipe type. Expected 'recipe-ref'." });
  }

  if (!recipeUri || typeof recipeUri !== "string") {
    return res.status(400).json({
      error: "Missing or invalid 'recipe' field. Expected a recipe URI string.",
    });
  }

  const engine = req.app.locals.engine;

  let recipe;
  
  try {
    const response = await fetch(recipeUri, {
      headers: { accept: "application/json" },
    });

    if (!response.ok) {
      const bodyText = await response.text().catch(() => "");
      return res.status(502).json({
        error: "Failed to fetch recipe document.",
        recipeUri,
        status: response.status,
        statusText: response.statusText,
        body: bodyText.slice(0, 1000),
      });
    }

    recipe = await response.json();
  } catch (err) {
    return res.status(502).json({
      error: "Error while fetching recipe document.",
      recipeUri,
      details: err instanceof Error ? err.message : String(err),
    });
  }

  if (!recipe || typeof recipe !== "object") {
    return res
      .status(400)
      .json({ error: "Recipe document is not a JSON object." });
  }

  const variables = recipe.variables || {};

  const content = await runRecipe(recipe, variables, engine);

  res.status(200).json(content);
}
