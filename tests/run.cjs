/* Register all suites in one process; no package installation is required. */
const fs = require("node:fs");
const path = require("node:path");
for (const file of fs.readdirSync(__dirname).filter(name => name.endsWith(".test.cjs")).sort()) {
  require(path.join(__dirname, file));
}
