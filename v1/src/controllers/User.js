const httpStatus = require('http-status');
const { passwordToHash, generateAccessToken, generateRefreshToken } = require('../scripts/utils/helper');
const uuid = require("uuid");
const eventEmitter = require("../scripts/events/eventEmitter");
const path = require("path");

const UserService = require('../services/UsersService');

const ProjectService = require('../services/ProjectsService');

class User {

    create(req, res) {

        req.body.password = passwordToHash(req.body.password);
        UserService.create(req.body)
            .then((response) => {

                res.status(httpStatus.CREATED).send(response);
            })
            .catch((e) => {
                next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Kayıt ekleme işlemi sırasında bir problem oluştu.\n ${e}`));
            });

    }

    login(req, res) {
        req.body.password = passwordToHash(req.body.password);
        console.log(UserService.findOneData(req.body));

        UserService.findOneData(req.body)
            .then((user) => {
                if (!user) {
                    return next(new ApiError(httpStatus.NOT_FOUND, "Böyle bir kayıt bulunmamaktadır."));

                }
                user = {
                    ...user.toObject(),
                    tokens: {
                        access_token: generateAccessToken(user),
                        refresh_token: generateRefreshToken(user),
                    },
                };
                delete user.password;
                res.status(httpStatus.OK).send(user);
            })
            .catch((e) => {
                next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Giriş yapma işlemi sırasında bir problem oluştu.\n ${e}`));
            });

    }

    index(req, res) {

        UserService.list().then((response) => {
            res.status(httpStatus.OK).send(response);
        })
            .catch((e) => {
                next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, e?.message));
            });

    }

    projectList(req, res) {
        ProjectService
            .list({ user_id: req.user?._id })
            .then((projects) => {
                res.status(httpStatus.OK).send(projects);
            })
            .catch((e) => {
                next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Proje listeleme işlemi sırasında bir problem oluştu.\n ${e}`));
            });
    }

    resetPassword(req, res) {


        const new_password = uuid.v4()?.split('-')[0] || `usr-${new Date().getTime()}`;
        console.log(new_password);

        UserService.updateWhere({ email: req.body.email }, { password: passwordToHash(new_password) })
            .then(updatedUser => {
                if (!updatedUser) {
                    return next(new ApiError(httpStatus.NOT_FOUND, "Böyle bir kayıt bulunmamaktadır."));
                }

                // eventEmitter.emit("send_email", {
                //     to: updatedUser.email, // list of receivers
                //     subject: "Şifre Sıfırlama", // Subject line
                //     html: `Talebiniz üzerine şifre sıfırlama işleminiz gerçekleştirimiştir.<br/> Giriş yaptıktan sonra şifrenizi değiştirmeyi unutmayınız. <br/> Yeni Şifreniz: <b>${new_password}</b>`,
                // });
                res.status(httpStatus.OK).send({
                    message: "Şifre sıfırlama işlemi için sisteme kayıtlı e-posta adresinize gereken bilgileri gönderdik."
                })
            })
            .catch((e) => {
                next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Şifre sıfırlama işlemi sırasında bir problem oluştu.\n ${e}`));
            });
    }

    update(req, res) {
        UserService.update(req.user?._id, req.body)
            .then(updatedUser => {
                if (!updatedUser) {
                    return next(new ApiError(httpStatus.NOT_FOUND, "Böyle bir kayıt bulunmamaktadır."));
                }
                res.status(httpStatus.OK).send(updatedUser);
            })
            .catch(() => {
                next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Güncelleme işlemi sırasında bir problem oluştu.\n ${e}`));
            });
    }
    changePassword(req, res) {
        req.body.password = passwordToHash(req.body.password);
        UserService.update(req.user?._id, req.body)
            .then(updatedUser => {
                if (!updatedUser) {
                    return next(new ApiError(httpStatus.NOT_FOUND, "Böyle bir kayıt bulunmamaktadır."));
                }
                res.status(httpStatus.OK).send(updatedUser);
            })
            .catch(() => {
                next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Güncelleme işlemi sırasında bir problem oluştu.\n ${e}`));
            });
    }

    deleteUser(req, res) {
        if (!req.params?.id) {
            return res.status(httpStatus.BAD_REQUEST).send({
                message: "ID Bilgisi Eksik",
            });
        }
        UserService.delete(req.params?.id)
            .then((deletedItem) => {
                if (!deletedItem) {
                    return next(new ApiError(httpStatus.NOT_FOUND, "Böyle bir kayıt bulunmamaktadır."));
                }
                else {
                    res.status(httpStatus.OK).send({
                        message: `${deletedItem.full_name} kişisi silinmiştir.`
                    });
                }
            })
            .catch((e) => {
                next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Silme işlemi sırasında bir problem oluştu.\n ${e}`));
            });
    }

    updateProfileImage(req, res) {
        console.log(req.files);
        if (!req?.files?.profile_image) {
            return next(new ApiError(httpStatus.NOT_FOUND, "İlgili dosya eklenmemiştir."));

        }

        const extension = path.extname(req.files.profile_image.name);
        if (extension !== ".png" && extension !== ".jpg" && extension !== ".jpeg")
            return next(new ApiError(httpStatus.NOT_FOUND, "İlgili dosya eklenmemiştir."));

        const fileName = `profile_image_${req?.user._id}${extension}`;
        const folderPath = path.join(__dirname, "../", "/uploads/users", fileName);

        req.files.profile_image.mv(folderPath, function (err) {
            if (err) {
                next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Dosya ekleme işlemi sırasında bir problem oluştu.\n ${err}`));
            }
            UserService.update(req.user._id, fileName)
                .then(updatedUser => {
                    if (!updatedUser) {
                        return next(new ApiError(httpStatus.NOT_FOUND, "Böyle bir kayıt bulunmamaktadır."));
                    }
                    res.status(httpStatus.OK).send(updatedUser);
                })
                .catch(() => {
                    next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Güncelleme işlemi sırasında bir problem oluştu.\n ${e}`));
                });
        });
    }
}


module.exports = new User();