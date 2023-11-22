const { response } = require('express');
const { insert, modify, list, remove } = require('../services/Projects');
const httpStatus = require('http-status');


const index = (req, res) => {
    list().then((response) => {
        res.status(httpStatus.OK).send(response);
    })
        .catch((e) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).send(e);
        });

};

const create = (req, res) => {
    req.body.user_id = req.user;
    insert(req.body)
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
    modify(req.body, req.params?.id)
        .then((updatedProject) => {
            res.status(httpStatus.OK).send(updatedProject);
        })
        .catch((e) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).send(e);
        });
};

const deleteProject = (req, res) => {
    if (!req.params?.id) {
        return res.status(httpStatus.BAD_REQUEST).send({
            message: "ID Bilgisi Eksik",
        });
    }
    remove(req.params?.id)
        .then((deletedItem) => {

            if (!deletedItem) {
                res.status(httpStatus.NOT_FOUND).send({
                    message: "Böyle bir kayıt bulunmamaktadır."
                })
            }
            res.status(httpStatus.OK).send({
                message: `${deletedItem.name} Proje silinmiştir.`
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
    deleteProject,
};