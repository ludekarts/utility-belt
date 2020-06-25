async function utilityBeltImport() {
  let module;
  try {
    // Development.
    console.log("Dev");

    module = await import("../../src/index.js");
  } catch (error) {
    // Production.
    module = await import("../../docs/lib/utility-belt.module.js");
  }
  return module;
}

export default utilityBeltImport();