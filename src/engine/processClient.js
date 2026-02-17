import fetch from "node-fetch";
import { callbackRegistry } from "./callbackRegistry.js";

/** Converts [{ id, value }, ...] into { id: value, ... } */
function normalize(outputsArray) {
  const out = {};
  for (const o of outputsArray) out[o.id] = o.value;
  return out;
}

/**
 * Client that executes a single node by POSTing to its execution URL.
 * Supports sync (immediate response) and async (202 + polling or callback) modes.
 */
export class ProcessClient {

  /** Executes the node; returns normalized outputs. Uses callback when subscriber present, else polls. */
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

    // Sync mode: wait for immediate JSON response
    if (mode === "sync") {
      if (!response.ok) throw new Error(await response.text());
      const json = await response.json();
      const location = response.headers.get("location") || ""; // job identifier
      return normalize(json.outputs);
    }

    // Async mode: expect 202, then either wait for callback or poll
    if (response.status !== 202)
      throw new Error(`Expected 202, got ${response.status}`);

    const location = response.headers.get("Location");
    if (!location) throw new Error("Missing Location header");

    const jobId = location.split("/").pop();

    // Subscriber present: external system will call our callback; wait for it
    if (body.subscriber) {
      const data = await callbackRegistry.waitFor(jobId);
      return normalize(data.outputs);
    }

    return this.poll(location);
  }

  /** Polls jobUrl until the job completes, fails, or is cancelled. */
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
