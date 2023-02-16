const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const multer = require("../middlewares/multer-config");
const sauceCtrl = require("../controllers/sauce");

router.get("/", sauceCtrl.getAllSauces);
router.get("/:id", sauceCtrl.getOneSauce);
router.post("/", auth, multer, sauceCtrl.createSauce);
router.put("/:id", sauceCtrl.updateSauce);
router.delete("/:id", sauceCtrl.deleteSauce);
router.post("/:id/like", sauceCtrl.likeSauce);

module.exports = router;