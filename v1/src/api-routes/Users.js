//validate middleware
const validate = require('../middlewares/validate');
//validations
const schemas = require('../validations/Users');

const express = require('express');
const { create, index, login, projectList } = require('../controllers/Users');
const authenticate = require('../middlewares/authenticate');
const router = express.Router();

router.get('/', index);
router
    .route("/")
    .post(validate(schemas.createValidation), create);

router
    .route("/login")
    .post(validate(schemas.loginValidation), login);

router
    .route("/projects")
    .get(authenticate, projectList);

module.exports = router;
