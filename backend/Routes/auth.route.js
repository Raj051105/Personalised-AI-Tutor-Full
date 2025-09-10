import { Router } from "express";
import { GetUser, Login, Register } from "../Controllers/auth.controller.js";
import { protect } from "../Middleware/AuthMiddleware.js";

const authRoute = Router();

authRoute.post('/login',Login)
authRoute.post('/register',Register);
authRoute.get('/getUser', protect, GetUser)

export default authRoute;