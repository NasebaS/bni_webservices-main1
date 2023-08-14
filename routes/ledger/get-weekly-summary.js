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

const checkPaymentLog = "SELECT * from collection_entry join member_master on collection_entry.member_id=member_master.member_id where collection_date >=? and collection_date <=? order by member_name, attendance_type";

Router.post("/", VerifyToken, (req, res) => {
    let params = req.body;
    var start = moment(params.weekDay, 'DD-MM-YYYY').subtract(6, 'days').format('YYYY-MM-DD'), 
    end   = moment(params.weekDay, 'DD-MM-YYYY').format('YYYY-MM-DD');
   
        mysqlConnection.query(checkPaymentLog, [start,end], (err, log_rows, fields) => {
            if (!err) {
                if(log_rows !=''){
                    let response = {
                        "status": APIResponse.Success,
                        "LedgerDetails": log_rows,
                        "success":true
                    }                                
                    res.send(response);
                }
                else{
                    let response = {
                        "status": APIResponse.Failed,
                        "LedgerDetails": [],
                        "success":false
                    }                                
                    res.send(response);
                }
            }
        }); 
});

module.exports = Router;