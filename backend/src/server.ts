import express from "express";
import authRoutes from "./routes/authRoute";

const app = express();
const port = 3000;

app.use(express.json());
app.use(authRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});