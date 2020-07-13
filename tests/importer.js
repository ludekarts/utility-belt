async function utilityBeltImport() {
  let module;
  try {
    module = await import("../../src/index.js");
    console.log("Env::Development");
  } catch (error) {
    module = await import("../lib/utility-belt.module.js");
    console.log("Env::Production");
  }
  return module;
}

export default utilityBeltImport();