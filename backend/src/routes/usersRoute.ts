import express from "express";
import usersController from "../controllers/usersController.js";

const router = express.Router();

router.get("/", usersController.listUsers);
router.get("/:id", usersController.getUser);
router.put("/:id", usersController.updateUser);
router.delete("/:id", usersController.deleteUser);

export default router;
