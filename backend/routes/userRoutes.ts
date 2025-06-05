import { Router } from "express";
import {
  registerUserController,
  loginUserController,
} from "../controllers/user-controller";

const router = Router();

// User registration
router.post("/register", registerUserController);

// User login
router.post("/login", loginUserController);

// User logout (if needed, can be added here)
// router.get("/logout", ...);

export default router;
