import app from "../src/app.js";

// Export the Express app directly so Vercel can invoke it without an extra
// serverless wrapper layer that can keep the function open.
export default function handler(req: any, res: any) {
  return app(req, res);
}
