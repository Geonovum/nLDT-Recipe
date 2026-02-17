export async function runRecipe(recipe, variables, engine, callback) {
  console.log(`Recipe Id ${recipe.id}`);
  console.log(`Title ${recipe.title}`);
  console.log(`Description ${recipe.description}`);

  // substitute variables in the recipe
  for (const process of recipe.processing) {
    var nodes = process.nodes;
    for (const node of process.nodes) {
      var inputs = node.body.inputs;

      for (const [inputName, inputValue] of Object.entries(inputs)) {
        if (
          typeof inputValue === "string" &&
          (inputValue.startsWith("$") || inputValue.startsWith("!"))
        ) {
          const variableName = inputValue.slice(1); // Remove $ prefix
          if (variables.hasOwnProperty(variableName)) {
            node.body.inputs[inputName] = variables[variableName];
            console.log(
              `Substituted variable ${inputValue} with value ${variables[variableName]} in node ${node.id}`,
            );
          } else {
            console.warn(
              `Variable ${variableName} not found for substitution in node ${node.id}`,
            );
            return callback(
              {
                httpCode: 400,
                code: `Variable not found`,
                description: `Variable ${variableName} not found for substitution in node ${node.id}`,
              },
              undefined,
            );
          }
        }
      }
    }
  }

  // Accumulate terminal results from each process (keyed by process ID)
  const content = {};

  for (const process of recipe.processing) {
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

  return callback(undefined, content);
}
