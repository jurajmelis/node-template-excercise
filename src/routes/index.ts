import { Router } from "express";
import auth from "./auth.routes";
import user from "./user.routes";
import farm from "./farm.routes";

const routes = Router();

routes.use("/auth", auth);
routes.use("/users", user);
routes.use("/v1/farms", farm);

export default routes;
