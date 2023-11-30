const { response } = require('express');
const httpStatus = require('http-status');
const ProjectService = require('../services/ProjectsService');
const ApiError = require('../errors/ApiError');


class Project {

    index(req, res) {
        ProjectService.list().then((response) => {
            res.status(httpStatus.OK).send(response);
        })
            .catch((e) => {
                next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, e?.message));
            });

    };

    create(req, res) {
        req.body.user_id = req.user;
        ProjectService.create(req.body)
            .then((response) => {

                res.status(httpStatus.CREATED).send(response);
            })
            .catch((e) => {
                next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Kayıt ekleme işlemi sırasında bir problem oluştu.\n ${e}`));
            });

    };

    update(req, res, next) {
        if (!req.params?.id) {
            return res.status(httpStatus.BAD_REQUEST).send({
                message: "ID Bilgisi Eksik",
            });
        }
        ProjectService.update(req.params?.id, req.body)
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

    deleteProject(req, res) {
        if (!req.params?.id) {
            return res.status(httpStatus.BAD_REQUEST).send({
                message: "ID Bilgisi Eksik",
            });
        }
        ProjectService.delete(req.params?.id)
            .then((deletedItem) => {

                if (!deletedItem) {
                    return next(new ApiError(httpStatus.NOT_FOUND, "Böyle bir kayıt bulunmamaktadır."));
                }
                res.status(httpStatus.OK).send({
                    message: `${deletedItem.name} Proje silinmiştir.`
                });
            })
            .catch((e) => {
                next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Silme işlemi sırasında bir problem oluştu.\n ${e}`));
            });
    }

}

module.exports = new Project();










