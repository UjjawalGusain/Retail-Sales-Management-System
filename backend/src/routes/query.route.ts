import {Router} from "express"
import QueryController from "./../controllers/query.controller.js";

const router = Router();
router.get("/lightQuery", QueryController.getTransactionsLight)
router.get("/heavyQuery", QueryController.getTransactionsHeavy)

export default router;