//validate middleware
const validate = require('../middlewares/validate');
//validations
const schemas = require('../validations/Tasks');

const express = require('express');
const { index, create, update, deleteTask, makeComment, deleteComment, addSubTask, fetchTask } = require('../controllers/Tasks');

const authenticate = require('../middlewares/authenticate');
const router = express.Router();


router
    .route("/")
    .post(authenticate, validate(schemas.createValidation), create);

router
    .route("/:id/make-comment")
    .post(authenticate, validate(schemas.commentValidation), makeComment);

router
    .route("/:id/add-sub-task")
    .post(authenticate, validate(schemas.createValidation), addSubTask);

router
    .route("/:id")
    .get(authenticate, fetchTask);

router
    .route("/:projectId/for-project")
    .get(authenticate, index);

router
    .route("/:id/:commentId")
    .delete(authenticate, deleteComment);

router
    .route("/:id")
    .patch(authenticate, validate(schemas.updateValidation), update);

router
    .route("/:id")
    .delete(authenticate, deleteTask);

module.exports = router;
