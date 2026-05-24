import serverless from "serverless-http";
import app from "../src/app.js";

// Export a serverless handler for Vercel (and other serverless platforms).
// This file will be picked up by Vercel as a serverless function entrypoint.
export default serverless(app as any);
