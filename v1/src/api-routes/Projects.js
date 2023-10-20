//validate middleware
const validate = require('../middlewares/validate');
//validations
const schemas = require('../validations/Projects');

const express = require('express');
const { index, create, update } = require('../controllers/Projects');
const authenticate = require('../middlewares/authenticate');
const router = express.Router();

router
    .route("/")
    .get(authenticate, index);
router
    .route("/")
    .post(authenticate, validate(schemas.createValidation), create);

router
    .route("/:id")
    .patch(authenticate, validate(schemas.updateValidation), update);

module.exports = router;
