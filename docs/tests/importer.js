async function utilityBeltImport() {
  let module;
  try {
    module = await import("../../src/index.js");
    console.log("Env::Development");
  } catch (error) {
    console.error(error);
    module = await import("../assets/ubm/utility-belt.js");
    console.log("Env::Production");
  }
  return module;
}

export default utilityBeltImport();