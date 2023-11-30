const { response } = require('express');
const httpStatus = require('http-status');

const TaskService = require('../services/TasksService');


const index = (req, res) => {
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
            res.status(httpStatus.INTERNAL_SERVER_ERROR).send(e);
        });

};

const create = (req, res) => {
    req.body.user_id = req.user;
    TaskService.create(req.body)
        .then((response) => {

            res.status(httpStatus.CREATED).send(response);
        })
        .catch((e) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).send(e);
        });

};

const update = (req, res) => {
    if (!req.params?.id) {
        return res.status(httpStatus.BAD_REQUEST).send({
            message: "ID Bilgisi Eksik",
        });
    }
    TaskService.update(req.params?.id, req.body)
        .then((updatedDoc) => {
            res.status(httpStatus.OK).send(updatedDoc);
        })
        .catch((e) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).send(e);
        });
};

const deleteTask = (req, res) => {
    if (!req.params?.id) {
        return res.status(httpStatus.BAD_REQUEST).send({
            message: "ID Bilgisi Eksik",
        });
    }
    TaskService.delete(req.params?.id)
        .then((deletedItem) => {

            if (!deletedItem) {
                res.status(httpStatus.NOT_FOUND).send({
                    message: "Böyle bir kayıt bulunmamaktadır."
                })
            }
            res.status(httpStatus.OK).send({
                message: `${deletedItem.name} Task silinmiştir.`
            });
        })
        .catch((e) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
                error: `Silme işlemi sırasında bir problem oluştur.\n ${e}`
            });
        });
}

const makeComment = (req, res) => {

    TaskService.findOne({ _id: req.params.id })
        .then(mainTask => {
            if (!mainTask) {
                return res.status(httpStatus.NOT_FOUND).send({
                    message: "Böyle bir kayıt bulunmamaktadır."
                })
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
                    return res.status(httpStatus.OK).send(updatedDoc);
                }).catch((e) => {
                    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
                        error: `Yorum ekleme işlemi sırasında bir problem oluştu.\n ${e}`,
                    });
                });
        }).catch((e) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
                error: `Yorum ekleme işlemi sırasında bir problem oluştu.\n ${e}`,
            });
        });
}

const deleteComment = (req, res) => {
    TaskService.findOne({ _id: req.params.id })
        .then(mainTask => {
            if (!mainTask) {
                return res.status(httpStatus.NOT_FOUND).send({
                    message: "Böyle bir kayıt bulunmamaktadır."
                })
            }
            console.log(mainTask);

            mainTask.comments = mainTask.comments.filter((comment) => comment._id != req.params.commentId);

            mainTask
                .save()
                .then((updatedDoc) => {
                    return res.status(httpStatus.OK).send(updatedDoc);
                }).catch((e) => {
                    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
                        error: `Silme işlemi sırasında bir problem oluştu.\n ${e}`,
                    });
                });
        }).catch((e) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
                error: `Silme işlemi sırasında bir problem oluştu.\n ${e}`,
            });
        });
}

const addSubTask = (req, res) => {

    if (!req.params.id) {
        return res.status(httpStatus.BAD_REQUEST).send({
            message: "ID Bilgisi Eksik",
        });
    }

    TaskService.findOne({ _id: req.params.id })
        .then((mainTask) => {
            if (!mainTask) {
                return res.status(httpStatus.NOT_FOUND).send({
                    message: "Böyle bir kayıt bulunmamaktadır."
                })
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
                            res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
                                error: `Alt görev ekleme işlemi sırasında bir problem oluştu.\n ${e}`,
                            });

                        });
                })
                .catch((e) => {
                    res.status(httpStatus.INTERNAL_SERVER_ERROR).send(e);
                });
        }).catch((e) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
                error: `Alt görev ekleme işlemi sırasında bir problem oluştu.\n ${e}`,
            });
        });
}

const fetchTask = (req, res) => {
    if (!req.params.id) {
        return res.status(httpStatus.BAD_REQUEST).send({
            message: "ID Bilgisi Eksik",
        });
    }

    TaskService.findOne({ _id: req.params.id }, true)
        .then((task) => {
            if (!task) {
                return res.status(httpStatus.NOT_FOUND).send({
                    message: "Böyle bir kayıt bulunmamaktadır."
                })
            }
            res.status(httpStatus.OK).send(task);
        }).catch((e) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
                error: `Kayıt bulma işlemi sırasında bir problem oluştu.\n ${e}`,
            });
        });
}



module.exports = {
    create,
    index,
    update,
    deleteTask,
    makeComment,
    deleteComment,
    addSubTask,
    fetchTask,
};