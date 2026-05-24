import "dotenv/config";
import app from "./app.js";

const port = process.env.PORT || 4000;

// ── Start ──────────────────────────────────────────────────
app.listen(port, () => {
  console.log(`🌿 EcoPoint API running on http://localhost:${port}`);
  console.log(`     Routes:`);
  console.log(`   - POST   /api/auth/register`);
  console.log(`   - POST   /api/auth/login`);
  console.log(`   - GET    /api/auth/me`);
  console.log(`   - GET    /api/dashboard`);
  console.log(`   - GET    /api/leaderboard`);
  console.log(`   - GET    /api/rewards`);
  console.log(`   - POST   /api/rewards/redeem`);
  console.log(`   - GET    /api/rewards/history`);
  console.log(`   - GET    /api/badges`);
  console.log(`   - GET    /api/badges/admin/all`);
  console.log(`   - POST   /api/badges/admin`);
  console.log(`   - PUT    /api/badges/admin/:id`);
  console.log(`   - DELETE /api/badges/admin/:id`);
  console.log(`   - GET    /api/daily-challenges/today`);
  console.log(`   - POST   /api/daily-challenges/progress`);
  console.log(`   - POST   /api/daily-challenges/claim`);
  console.log(`   - GET    /api/daily-challenges/admin/all`);
  console.log(`   - GET    /api/daily-challenges/admin/today`);
  console.log(`   - POST   /api/daily-challenges/admin`);
  console.log(`   - PUT    /api/daily-challenges/admin/:id`);
  console.log(`   - DELETE /api/daily-challenges/admin/:id`);
  console.log(`   - GET    /api/levels`);
  console.log(`   - GET    /api/admin/users`);
  console.log(`   - GET    /api/admin/users/:id`);
  console.log(`   - PUT    /api/admin/users/:id`);
  console.log(`   - DELETE /api/admin/users/:id`);
  console.log(`   - POST   /api/levels/admin`);
  console.log(`   - PUT    /api/levels/admin/:id`);
  console.log(`   - DELETE /api/levels/admin/:id`);
  console.log(`   - GET    /api/admin/waste-reports`);
  console.log(`   - GET    /api/admin/waste-reports/:id`);
  console.log(`   - POST   /api/admin/waste-reports/:id/approve`);
  console.log(`   - POST   /api/admin/waste-reports/:id/reject`);
  console.log(`   - GET    /api/health`);
});
