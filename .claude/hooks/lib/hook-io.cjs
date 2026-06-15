function readJsonFromStdin() {
  let input = "";

  try {
    input = require("fs").readFileSync(0, "utf8");
  } catch {
    return {};
  }

  if (!input.trim()) {
    return {};
  }

  try {
    return JSON.parse(input);
  } catch {
    return {};
  }
}

function writeJson(payload) {
  process.stdout.write(JSON.stringify(payload));
}

module.exports = {
  readJsonFromStdin,
  writeJson,
};
