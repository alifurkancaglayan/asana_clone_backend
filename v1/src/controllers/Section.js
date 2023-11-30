const { response } = require('express');
const httpStatus = require('http-status');
const SectionService = require('../services/SectionsService');
const ApiError = require('../errors/ApiError');



class Section {

    index(req, res) {
        if (!req.params?.projectId) {
            return res.status(httpStatus.BAD_REQUEST).send({
                error: "Proje ID bilgisi eksik.."
            });
        }
        SectionService.list({ project_id: req.params?.projectId })
            .then((response) => {
                res.status(httpStatus.OK).send(response);
            })
            .catch((e) => {
                next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, e?.message));
            });

    };

    create(req, res) {
        req.body.user_id = req.user;
        SectionService.create(req.body)
            .then((response) => {

                res.status(httpStatus.CREATED).send(response);
            })
            .catch((e) => {
                next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Ekleme işlemi sırasında bir problem oluştu.\n ${e}`));
            });

    };

    update(req, res) {
        if (!req.params?.id) {
            return res.status(httpStatus.BAD_REQUEST).send({
                message: "ID Bilgisi Eksik",
            });
        }
        SectionService.update(req.params?.id, req.body)
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

    deleteSection(req, res) {
        if (!req.params?.id) {
            return res.status(httpStatus.BAD_REQUEST).send({
                message: "ID Bilgisi Eksik",
            });
        }
        SectionService.delete(req.params?.id)
            .then((deletedItem) => {

                if (!deletedItem) {
                    return next(new ApiError(httpStatus.NOT_FOUND, "Böyle bir kayıt bulunmamaktadır."));
                }
                res.status(httpStatus.OK).send({
                    message: `${deletedItem.name} Section silinmiştir.`
                });
            })
            .catch((e) => {
                next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Silme işlemi sırasında bir problem oluştu.\n ${e}`));
            });
    }

}
module.exports = new Section();




