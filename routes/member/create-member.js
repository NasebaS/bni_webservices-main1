const express = require("express");
const Router = express.Router();
var mysqlConnection = require('../../connection');
var VerifyToken = require('../auth/VerifyToken');

const APIResponse = {
    Success: 0,
    Failed: 1,
    ServerError: 2
}

var postNewMemberQuery = "insert into member_master SET ?";

Router.post("/",VerifyToken, (req, res) => {
    let params = req.body;
    let data = {member_name: params.member_name, email_id: params.email_id, alternate_number:params.alternate_number,
      mobile_no: params.mobile_no, address: params.address, industry_type: params.industry_type, 
      company_name: params.company_name, status: params.status };
     
    try {
            mysqlConnection.query(postNewMemberQuery, data, (err, rows, fields) => {
                if (!err) {
                  let response = {
                      "status": APIResponse.Success,
                      "member_id": rows.insertId,
                      "message": "Member has been added successfully..!"
                  }
                  res.send(response);
                } else {
                    let response = {
                        "status": APIResponse.ServerError,
                        "message": err
                    }
                    res.send(response);
                }
            });
    } catch (error) {
        let response = {
            "status": APIResponse.ServerError,
            "message": error
        }
        res.send(response);
    }
});

module.exports = Router;