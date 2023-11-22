const { insert, list, loginUser, modify, remove } = require('../services/Users');
const projectService = require("../services/Projects")
const httpStatus = require('http-status');
const { passwordToHash, generateAccessToken, generateRefreshToken } = require('../scripts/utils/helper');
const uuid = require("uuid");
const eventEmitter = require("../scripts/events/eventEmitter");
const path = require("path");


const create = (req, res) => {

    req.body.password = passwordToHash(req.body.password);
    insert(req.body)
        .then((response) => {

            res.status(httpStatus.CREATED).send(response);
        })
        .catch((e) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).send(e);
        });

}

const login = (req, res) => {
    req.body.password = passwordToHash(req.body.password);

    loginUser(req.body)
        .then((user) => {
            if (!user) {
                return res.status(httpStatus.NOT_FOUND).send({ message: 'Böyle bir kullanıcı bulunamadı.' });

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
            res.status(httpStatus.INTERNAL_SERVER_ERROR).send(e);
        });

}

const index = (req, res) => {

    list().then((response) => {
        res.status(httpStatus.OK).send(response);
    })
        .catch((e) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).send(e);
        });

}

const projectList = (req, res) => {
    projectService
        .list({ user_id: req.user?._id })
        .then((projects) => {
            res.status(httpStatus.OK).send(projects);
        })
        .catch((e) => {
            res.status(httpStatus.BAD_REQUEST).send({
                error: "Projeleri getirirken bir hata oldu."
            });
        });
}

const resetPassword = (req, res) => {


    const new_password = uuid.v4()?.split('-')[0] || `usr-${new Date().getTime()}`;
    console.log(new_password);

    modify({ email: req.body.email }, { password: passwordToHash(new_password) })
        .then(updatedUser => {
            if (!updatedUser) {
                return res.status(httpStatus.NOT_FOUND).send({ error: "Böyle bir kullanıcı bulunamadı." });
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
            res.status(httpStatus.INTERNAL_SERVER_ERROR).send(e);
        });
}

const update = (req, res) => {
    modify({ _id: req.user?._id }, req.body)
        .then(updatedUser => {
            res.status(httpStatus.OK).send(updatedUser);
        })
        .catch(() => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
                error: "Güncelleme işlemi sırasında bir hata meydana geldi."
            });
        });
}
const changePassword = (req, res) => {
    req.body.password = passwordToHash(req.body.password);
    modify({ _id: req.user?._id }, req.body)
        .then(updatedUser => {
            res.status(httpStatus.OK).send(updatedUser);
        })
        .catch(() => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
                error: "Güncelleme işlemi sırasında bir hata meydana geldi."
            });
        });
}

const deleteUser = (req, res) => {
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
            else {
                res.status(httpStatus.OK).send({
                    message: `${deletedItem.full_name} kişisi silinmiştir.`
                });
            }
        })
        .catch((e) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
                error: `Silme işlemi sırasında bir problem oluştu.\n ${e}`
            });
        });
}

const updateProfileImage = (req, res) => {
    console.log(req.files);
    if (!req?.files?.profile_image) {
        return res.status(httpStatus.BAD_REQUEST).send({
            error: "Bu işlemi yapabilmek için yeterli veriye sahip değilisiniz.",
        });

    }

    const extension = path.extname(req.files.profile_image.name);
    if (extension !== ".png" && extension !== ".jpg" && extension !== ".jpeg") return res.status(httpStatus.BAD_REQUEST).send({
        error: "Lütfen geçerli bir dosya yükleyiniz."
    });
    const fileName = `profile_image_${req?.user._id}${extension}`;
    const folderPath = path.join(__dirname, "../", "/uploads/users", fileName);

    req.files.profile_image.mv(folderPath, function (err) {
        if (err) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
                error: err
            });
        }
        modify({ _id: req.user._id }, { profile_image: fileName })
            .then(updatedUser => {
                res.status(httpStatus.OK).send(updatedUser);
            })
            .catch(() => {
                res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
                    error: "Güncelleme işlemi sırasında bir hata meydana geldi."
                });
            });
    });
}

module.exports = {
    create,
    index,
    login,
    projectList,
    resetPassword,
    update,
    deleteUser,
    changePassword,
    updateProfileImage,
};