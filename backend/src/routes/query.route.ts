import {Router} from "express"
import QueryController from "./../controllers/query.controller.js";

const router = Router();
router.get("/", QueryController.queryTransactions);
router.get("/totalUnits", QueryController.getTotalUnitsSold)
router.get("/totalAmount", QueryController.getTotalAmount)
router.get("/totalDiscount", QueryController.getTotalDiscount)
router.get("/lightQuery", QueryController.getTransactionsLight)
router.get("/heavyQuery", QueryController.getTransactionsHeavy)

export default router;