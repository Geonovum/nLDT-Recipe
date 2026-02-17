import { app } from "./app.js";
import utils from "./utils/utils.js";

// Listen on all IPv4 interfaces
const host = global.config.server.host;
const port = global.config.server.port;

app.listen(port, host, function (error) {
  if (error) {
    console.log("Unable to listen for connections", error);
    process.exit(10);
  }

  console.log(`\nRecipe server listening on:`);
  console.log(`  Host: ${host}`);
  console.log(`  Port: ${port}`);
  console.log(`  Service Root: ${app.serviceRoot}`);
  
  // Show all accessible URLs
  console.log(`\nAccessible URLs:`);
  if (host === '0.0.0.0') {
    // Get all bindable IPv4 addresses
    const bindableAddresses = utils.getBindableAddresses();

    bindableAddresses.forEach(addr => {
      console.log(`  http://${addr.address}:${port}${app.serviceRoot}`);
    });
    
    // Also show localhost
    console.log(`  http://localhost:${port}${app.serviceRoot}`);
    console.log(`  http://127.0.0.1:${port}${app.serviceRoot}`);
  } else {
    console.log(`  http://${host}:${port}${app.serviceRoot}`);
  }
});
