const { response } = require('express');
const httpStatus = require('http-status');

const TaskService = require('../services/TasksService');

class Task {

    index(req, res) {
        if (!req.params?.projectId) {
            return res.status(httpStatus.BAD_REQUEST).send({
                error: "Proje ID bilgisi eksik.."
            });
        }
        TaskService.list({ project_id: req.params.projectId })
            .then((response) => {
                res.status(httpStatus.OK).send(response);
            })
            .catch((e) => {
                next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, e?.message));
            });

    };

    create(req, res) {
        req.body.user_id = req.user;
        TaskService.create(req.body)
            .then((response) => {

                res.status(httpStatus.CREATED).send(response);
            })
            .catch((e) => {
                next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Kayıt ekleme işlemi sırasında bir problem oluştu.\n ${e}`));
            });

    };

    update(req, res) {
        if (!req.params?.id) {
            return res.status(httpStatus.BAD_REQUEST).send({
                message: "ID Bilgisi Eksik",
            });
        }
        TaskService.update(req.params?.id, req.body)
            .then((updatedDoc) => {
                if (!updatedDoc) {
                    return next(new ApiError(httpStatus.NOT_FOUND, "Böyle bir kayıt bulunmamaktadır."));
                }
                res.status(httpStatus.OK).send(updatedDoc);
            })
            .catch((e) => {
                next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Güncelleme işlemi sırasında bir problem oluştu.\n ${e}`));
            });
    };

    deleteTask(req, res) {
        if (!req.params?.id) {
            return res.status(httpStatus.BAD_REQUEST).send({
                message: "ID Bilgisi Eksik",
            });
        }
        TaskService.delete(req.params?.id)
            .then((deletedItem) => {

                if (!deletedItem) {
                    return next(new ApiError(httpStatus.NOT_FOUND, "Böyle bir kayıt bulunmamaktadır."));
                }
                res.status(httpStatus.OK).send({
                    message: `${deletedItem.name} Task silinmiştir.`
                });
            })
            .catch((e) => {
                next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Silme işlemi sırasında bir problem oluştu.\n ${e}`));
            });
    }

    makeComment(req, res) {

        TaskService.findOne({ _id: req.params.id })
            .then(mainTask => {
                if (!mainTask) {
                    return next(new ApiError(httpStatus.NOT_FOUND, "Böyle bir kayıt bulunmamaktadır."));
                }

                const comment = {
                    ...req.body,
                    commented_at: new Date(),
                    user_id: req.user,
                };
                mainTask.comments.push(comment);

                mainTask
                    .save()
                    .then((updatedDoc) => {
                        if (!updatedDoc) {
                            return next(new ApiError(httpStatus.NOT_FOUND, "Böyle bir kayıt bulunmamaktadır."));
                        }
                        return res.status(httpStatus.OK).send(updatedDoc);
                    })
                    .catch((e) => {
                        next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Yorum ekleme işlemi sırasında bir problem oluştu.\n ${e}`));
                    });
            }).catch((e) => {
                next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Yorum ekleme işlemi sırasında bir problem oluştu.\n ${e}`));
            });
    }

    deleteComment(req, res) {
        TaskService.findOne({ _id: req.params.id })
            .then(mainTask => {
                if (!mainTask) {
                    return next(new ApiError(httpStatus.NOT_FOUND, "Böyle bir kayıt bulunmamaktadır."));
                }
                console.log(mainTask);

                mainTask.comments = mainTask.comments.filter((comment) => comment._id != req.params.commentId);

                mainTask
                    .save()
                    .then((updatedDoc) => {
                        if (!updatedDoc) {
                            return next(new ApiError(httpStatus.NOT_FOUND, "Böyle bir kayıt bulunmamaktadır."));
                        }
                        return res.status(httpStatus.OK).send(updatedDoc);
                    })
                    .catch((e) => {
                        next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Silme işlemi sırasında bir problem oluştu.\n ${e}`));
                    });
            })
            .catch((e) => {
                next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Silme işlemi sırasında bir problem oluştu.\n ${e}`));
            });
    }

    addSubTask(req, res) {

        if (!req.params.id) {
            return res.status(httpStatus.BAD_REQUEST).send({
                message: "ID Bilgisi Eksik",
            });
        }

        TaskService.findOne({ _id: req.params.id })
            .then((mainTask) => {
                if (!mainTask) {
                    return next(new ApiError(httpStatus.NOT_FOUND, "Böyle bir kayıt bulunmamaktadır."));
                }
                console.log(mainTask);

                req.body.user_id = req.user;

                TaskService.create(req.body)
                    .then((subTask) => {

                        mainTask.sub_tasks.push(subTask);
                        mainTask
                            .save()
                            .then((updatedDoc) => {

                                return res.status(httpStatus.OK).send(updatedDoc);
                            }).catch((e) => {
                                next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Alt görev ekleme işlemi sırasında bir problem oluştu.\n ${e}`));

                            });
                    })
                    .catch((e) => {
                        res.status(httpStatus.INTERNAL_SERVER_ERROR).send(e);
                    });
            }).catch((e) => {
                next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Alt görev ekleme işlemi sırasında bir problem oluştu.\n ${e}`));
            });
    }

    fetchTask(req, res) {
        if (!req.params.id) {
            return res.status(httpStatus.BAD_REQUEST).send({
                message: "ID Bilgisi Eksik",
            });
        }

        TaskService.findOne({ _id: req.params.id }, true)
            .then((task) => {
                if (!task) {
                    return next(new ApiError(httpStatus.NOT_FOUND, "Böyle bir kayıt bulunmamaktadır."));
                }
                res.status(httpStatus.OK).send(task);
            }).catch((e) => {
                next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Kayıt bulma işlemi sırasında bir problem oluştu.\n ${e}`));
            });
    }
}


module.exports = new Task();