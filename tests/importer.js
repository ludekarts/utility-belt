async function utilityBeltImport() {
  let module;
  try {
    console.log("Env::Development");
    module = await import("../../src/index.js");
  } catch (error) {
    console.log("Env::Production");
    module = await import("../../docs/lib/utility-belt.module.js");
  }
  return module;
}

export default utilityBeltImport();