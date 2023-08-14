const express = require("express");
const Router = express.Router();
var mysqlConnection = require('../../connection');
var VerifyToken = require('../auth/VerifyToken');

const APIResponse = {
    Success: 0,
    Failed: 1,
    ServerError: 2
}

var postNewLegerQuery = "insert into ledger_master SET ?";
var updateLegerQuery = "update ledger_master SET ? where collection_id=?";

Router.post("/",VerifyToken, (req, res) => {
    let params = req.body;
    let data = {ledger_name: params.ledger_name, ledger_type: params.ledger_type, status:params.status,
        created_by: req.userId};
     
    try {
        if(params.ledger_id==0){
            mysqlConnection.query(postNewLegerQuery, data, (err, rows, fields) => {
                if (!err) {
                  let response = {
                      "status": APIResponse.Success,
                      "member_id": rows.insertId,
                      "message": "Ledger has been added successfully..!"
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
        }else{
            mysqlConnection.query(updateLegerQuery, [data,params.ledger_id], (err, rows, fields) => {
                if (!err) {
                  let response = {
                      "status": APIResponse.Success,
                      "member_id": rows.insertId,
                      "message": "Ledger has been updated successfully..!"
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
        }
            
    } catch (error) {
        let response = {
            "status": APIResponse.ServerError,
            "message": error
        }
        res.send(response);
    }
});

module.exports = Router;