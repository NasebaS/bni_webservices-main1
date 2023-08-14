const express = require("express");
const Router = express.Router();
var mysqlConnection = require('../../connection');
var VerifyToken = require('../auth/VerifyToken');

const APIResponse = {
    Success: 0,
    Failed: 1,
    ServerError: 2
}

const getMemberList = 'SELECT * FROM member_master where status=1 order by member_name asc';

Router.get("/", VerifyToken, (req, res) => {
    mysqlConnection.query(getMemberList, [], (err, memberRows, fields) => {
        if (!err) {
          let response = {
              "status": APIResponse.Success,
              "memberList": memberRows
          }
          res.send(response);

        } else {
            let response = {
                "status": APIResponse.ServerError,
                "memberList": []
            }
            res.send(response);
        }
    });
});

module.exports = Router;