// substitute variables in the recipe
function changeValue(obj, variables) {
  if (typeof obj === "object") {
    // iterating over the object using for..in
    for (var keys in obj) {
      //checking if the current value is an object itself
      if (typeof obj[keys] === "object") {
        // if so then again calling the same function
        changeValue(obj[keys], variables);
      } else {
        var inputValue = obj[keys];
        if (
          typeof inputValue === "string" &&
          (inputValue.startsWith("$") || inputValue.startsWith("!"))
        ) {
          const variableName = inputValue.slice(1); // Remove $ prefix
          if (variables.hasOwnProperty(variableName)) {
            obj[keys] = variables[variableName];
            console.log(
              `Substituted variable ${inputValue} with value ${variables[variableName]} in node ${obj[keys]}`,
            );
          } else {
            console.warn(
              `Variable ${variableName} not found for substitution in node ${obj[keys]}`,
            );
          }
        }
      }
    }
    return obj;
  }
}

export async function runRecipe(recipe, variables, engine, callback) {
  console.log(`Recipe Id ${recipe.id}`);
  console.log(`Title ${recipe.title}`);
  console.log(`Description ${recipe.description}`);

  // substitute variables in the recipe
  for (const process of recipe.processing) {
    for (const node of process.nodes) {
      changeValue(node, variables);
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
