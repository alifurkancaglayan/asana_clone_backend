const { response } = require('express');
const httpStatus = require('http-status');
const SectionService = require('../services/SectionsService');

const index = (req, res) => {
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
            res.status(httpStatus.INTERNAL_SERVER_ERROR).send(e);
        });

};

const create = (req, res) => {
    req.body.user_id = req.user;
    SectionService.create(req.body)
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
    SectionService.update(req.params?.id, req.body)
        .then((updatedDoc) => {
            res.status(httpStatus.OK).send(updatedDoc);
        })
        .catch((e) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).send(e);
        });
};

const deleteSection = (req, res) => {
    if (!req.params?.id) {
        return res.status(httpStatus.BAD_REQUEST).send({
            message: "ID Bilgisi Eksik",
        });
    }
    SectionService.delete(req.params?.id)
        .then((deletedItem) => {

            if (!deletedItem) {
                res.status(httpStatus.NOT_FOUND).send({
                    message: "Böyle bir kayıt bulunmamaktadır."
                })
            }
            res.status(httpStatus.OK).send({
                message: `${deletedItem.name} Section silinmiştir.`
            });
        })
        .catch((e) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
                error: `Silme işlemi sırasında bir problem oluştur.\n ${e}`
            });
        });
}



module.exports = {
    create,
    index,
    update,
    deleteSection,
};