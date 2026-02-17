/**
 * POST /process/:jobId/callback?type=success|failed
 *
 * Handles external callbacks for asynchronous processing jobs.
 * Called when a background job completes (successfully or with failure).
 * The callback registry is used to resolve any promises waiting on the job result.
 */
export async function post(req, res) {
  const { jobId } = req.params;
  const type = req.query.type;

  console.log(`Callback received: ${jobId} (${type})`);

  // Forward the result to the callback registry based on outcome
  if (type === "success") {
    req.app.locals.callbackRegistry.success(jobId, req.body);
  } else if (type === "failed") {
    req.app.locals.callbackRegistry.failed(jobId, req.body);
  }

  res.status(200).end();
}
