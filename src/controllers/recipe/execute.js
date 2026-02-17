export async function post(req, res) {
  const recipe = req.body;
  const engine = req.app.locals.engine;

  console.log(`Recipe Id ${recipe.id}`);
  console.log(`Title ${recipe.title}`);
  console.log(`Description ${recipe.description}`);

  const content = {};

  var processing = recipe.processing;
  for (const process of processing) {
    console.log("═".repeat(50));
    console.log(`Running ${process.id}`);
    console.log(`Title ${process.title}`);
    console.log(`Description ${process.description}`);
    console.log("-".repeat(50));

    // Execute the process and store the results
    const results = await engine.execute(process.nodes);

    // Store the results in the content object using the process ID as the key
    content[process.id] = results.terminalResults;

    console.log("=".repeat(50));
    console.log("All calculations completed successfully!\n");
    console.log("Results:");
    console.log(results);
  }

  res.status(200).json(content);
}
