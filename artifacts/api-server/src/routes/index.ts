import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import tenantRouter from "./tenants";
import rolesRouter from "./roles";
import auditRouter from "./audit";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(tenantRouter);
router.use(rolesRouter);
router.use(auditRouter);

export default router;
