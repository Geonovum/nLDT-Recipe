export async function post(req, res) {
  const { jobId } = req.params;
  const type = req.query.type;

  console.log(`Callback received: ${jobId} (${type})`);

  if (type === "success") {
    req.app.locals.callbackRegistry.success(jobId, req.body);
  } else if (type === "failed") {
    req.app.locals.callbackRegistry.failed(jobId, req.body);
  }

  res.status(200).end();
}
