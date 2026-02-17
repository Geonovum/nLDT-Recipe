export function extractDependencies(node) {
  const deps = new Set();

  for (const value of Object.values(node.body.inputs || {})) {
    if (typeof value === "string" && value.startsWith(":")) {
      const match = value.match(/^:(.+)\.outputs\.(.+)$/);
      if (!match) throw new Error(`Invalid reference: ${value}`);
      deps.add(match[1]);
    }
  }

  return [...deps];
}

export function resolveInputs(node, results) {
  const resolved = structuredClone(node.body);
  resolved.inputs = {};

  for (const [key, value] of Object.entries(node.body.inputs || {})) {
    if (typeof value === "string" && value.startsWith(":")) {
      const [, stepId, outputName] = value.match(/^:(.+)\.outputs\.(.+)$/);

      if (!results[stepId])
        throw new Error(`Dependency '${stepId}' not resolved`);

      resolved.inputs[key] = results[stepId][outputName];
    } else {
      resolved.inputs[key] = value;
    }
  }

  return resolved;
}

export function getTerminalNodes(nodes) {
  const referenced = new Set();

  for (const node of nodes) {
    for (const value of Object.values(node.body.inputs || {})) {
      if (typeof value === "string" && value.startsWith(":")) {
        const [, stepId] = value.match(/^:(.+)\.outputs\./);
        referenced.add(stepId);
      }
    }
  }

  return nodes
    .map((n) => n.id)
    .filter((id) => !referenced.has(id));
}
