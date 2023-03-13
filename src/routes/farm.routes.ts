import { RequestHandler, Router } from "express";
import { FarmsController } from "modules/farms/farms.controller";
const router = Router();
const farmsController = new FarmsController();

router.post("/create", farmsController.create.bind(farmsController) as RequestHandler);
router.post("/delete", farmsController.delete.bind(farmsController) as RequestHandler);
router.post("/all", farmsController.all.bind(farmsController) as RequestHandler);

export default router;
