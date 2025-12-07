import {Router} from "express"
import QueryController from "src/controllers/query.controller";

const router = Router();
router.get("/", QueryController.queryTransactions);

export default router;