import { runRecipe } from "../../models/recipe/execute.js";

/**
 * POST /recipe/execute
 *
 * Executes a recipe by running each of its processes sequentially.
 * Each process is run through the engine, and terminal results are collected
 * into a content object keyed by process ID. Returns the aggregated results.
 */
export async function post(req, res) {
  const recipe = req.body;
  const engine = req.app.locals.engine;

  const type = recipe.type;
  if (type !== "recipe") {
    return res
      .status(400)
      .json({ error: "Invalid recipe type. Expected 'recipe'." });
  }

  const variables = req.body?.variables || {};

  await runRecipe(recipe, variables, engine, function (err, content) {
    res.status(200).json(content);
  });
}
