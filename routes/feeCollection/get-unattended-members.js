const express = require("express");
const Router = express.Router();
var mysqlConnection = require('../../connection');
var VerifyToken = require('../auth/VerifyToken');
var moment = require('moment');  

const APIResponse = {
    Success: 0,
    Failed: 1,
    ServerError: 2
}

const getMemberList = "select * from member_master where status=1 and (member_id in (SELECT member_id FROM `collection_log` WHERE attendance='' or attendance is null and week_date=?) or member_id not in (SELECT member_id FROM `collection_log` WHERE week_date=?))";

Router.post("/",VerifyToken, (req, res) => {
    let params = req.body;
    
    mysqlConnection.query(getMemberList, [moment(params.weekDay, 'DD-MM-YYYY').format('YYYY-MM-DD'), moment(params.weekDay, 'DD-MM-YYYY').format('YYYY-MM-DD')], (err, memberRows, fields) => {
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