const express = require("express");
const multer = require('multer');
const Router = express.Router();
const mysqlConnection = require("../../connection");
var VerifyToken = require('../auth/VerifyToken');

const LoginResponse = {
    Success: 0,
    Failed: 1,
    ServerError: 2
}

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '././images');

    },
    filename: (req, file, cb) => {
        var filetype = '';
        if (file.mimetype === 'image/gif') {
            filetype = 'gif';
        }
        if (file.mimetype === 'image/png') {
            filetype = 'png';
        }
        if (file.mimetype === 'image/jpeg') {
            filetype = 'jpg';
        }
        cb(null, 'image-' + Date.now() + '.' + filetype);
    }
});


var upload = multer({
    storage: storage
});

Router.post('/',VerifyToken, upload.single('uploadedImage'), function (err,req, res, next) {
    let statusCode = LoginResponse.Failed;

    if (!req.file) {
        res.status(500);
         return next(err);
    }

    let params = req.body;
    let ImgPath = req.file.filename;

    const imageQuery = 'UPDATE member_master SET image_path=? WHERE member_id=?';

    mysqlConnection.query(imageQuery, [ImgPath, params.member_id], (err, result, fields) => {

        if (!err) {
            if (result.affectedRows > 0) {
                statusCode = LoginResponse.Success

                let response = {
                    "status": statusCode,
                    "imageUrl": driverImgPath,
                }
                res.send(response);

            } else {
                let response = {
                    "status": statusCode,
                    "imageUrl": driverImgPath,
                }
                res.send(response);
            }

        } else {
            let response = {
                "status": LoginResponse.ServerError,
                "userDetails": [],
            }
            res.send(response);
        }
    });
});

module.exports = Router;