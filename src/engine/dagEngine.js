import {
  extractDependencies,
  resolveInputs,
  getTerminalNodes,
} from "./dependencyResolver.js";

export class DagEngine {
  constructor(processClient) {
    this.processClient = processClient;
  }

  async execute(_nodes) {
    const results = {};
    const nodes = new Map();
    const dependencies = new Map();
    const dependents = new Map();

    for (const node of _nodes) {
      nodes.set(node.id, node);

      const deps = extractDependencies(node);
      dependencies.set(node.id, new Set(deps));

      for (const dep of deps) {
        if (!dependents.has(dep)) dependents.set(dep, new Set());
        dependents.get(dep).add(node.id);
      }
    }

    const ready = [...nodes.keys()].filter(
      (id) => dependencies.get(id).size === 0,
    );

    const executed = new Set();

    while (ready.length > 0) {
      const batch = [...ready];
      ready.length = 0;

      await Promise.all(
        batch.map(async (id) => {
          const node = nodes.get(id);

          const resolvedBody = resolveInputs(node, results);
          const execNode = { ...node, body: resolvedBody };

          console.log(`Executing node ${id} (${node.link.title}) with resolved body:`, resolvedBody);
          const output = await this.processClient.execute(execNode);

          results[id] = output;
          executed.add(id);

          for (const child of dependents.get(id) || []) {
            dependencies.get(child).delete(id);
            if (dependencies.get(child).size === 0) ready.push(child);
          }
        }),
      );
    }

    if (executed.size !== nodes.size)
      throw new Error("Cycle detected or unresolved dependency");

    const terminalIds = getTerminalNodes(_nodes);

    return {
      allResults: results,
      terminalResults: Object.fromEntries(
        terminalIds.map((id) => [id, results[id]]),
      ),
    };
  }
}
