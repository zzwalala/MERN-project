const express = require("express");

const router = express.Router();

const { check } = require("express-validator");

const placesControllers = require("../controllers/places-controllers");
const checkAuth = require("../middleware/check-auth");
const fileUpload = require('../middleware/file-upload')
router.get("/:pid", placesControllers.getPlaceById);

router.get("/user/:uid", placesControllers.getPlacesByUserId);

router.use(checkAuth)

router.post(
  "/",
  fileUpload.single('image'),
  [
    check("title").not().isEmpty(),
    check("description").isLength({ min: 6 }),
    check("address").not().isEmpty()
  ],
  placesControllers.createPlace
);

router.patch("/:pid", 
  [
    check("title").not().isEmpty(),
    check("description").isLength({ min: 6 })
  ],
  placesControllers.updatePlaceById);

router.delete("/:pid", placesControllers.deletePlace);

module.exports = router;
