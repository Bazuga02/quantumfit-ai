// Test file to verify imports work
import { registerRoutes } from "./server/routes.js";
import { PostgresStorage } from "./server/storage.js";

console.log("Imports successful!");

// This is just a test - we won't actually run this
export default function test() {
  return "imports work";
}
