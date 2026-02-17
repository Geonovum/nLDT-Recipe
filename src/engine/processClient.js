import fetch from "node-fetch";
import { callbackRegistry } from "./callbackRegistry.js";

function normalize(outputsArray) {
  const out = {};
  for (const o of outputsArray) out[o.id] = o.value;
  return out;
}

export class ProcessClient {

  async execute(node) {
    const mode = node.execution?.mode || "sync";
    const executionUrl = `${node.link.href}/execution`;
    const body = structuredClone(node.body);

    var headers = { "Content-Type": "application/json" };
    if (mode === "async") 
      headers["Prefer"] = "respond-async";

    const response = await fetch(executionUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    // SYNC
    if (mode === "sync") {
      if (!response.ok) throw new Error(await response.text());
      const json = await response.json();
      const location = response.headers.get("location") || ""; // job identifier
      return normalize(json.outputs);
    }

    // ASYNC
    if (response.status !== 202)
      throw new Error(`Expected 202, got ${response.status}`);

    const location = response.headers.get("Location");
    if (!location) throw new Error("Missing Location header");

    const jobId = location.split("/").pop();

    if (body.subscriber) {
      var aa = await callbackRegistry.waitFor(jobId);
      return normalize(aa.outputs);
    }

    return this.poll(location);
  }

  async poll(jobUrl, interval = 500) {
    while (true) {
      await new Promise((r) => setTimeout(r, interval));
      const resp = await fetch(jobUrl);
      const json = await resp.json();

      if (json.status === "successful") return normalize(json.outputs);
      if (["failed", "cancelled"].includes(json.status))
        throw new Error(`Job failed: ${json.status}`);
    }
  }
}
