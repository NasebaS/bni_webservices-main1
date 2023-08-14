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

Router.post("/",VerifyToken, async (req, res) => {
    let params = req.body;
    let data = {secretory_id: req.userId, member_id: params.member_id, 
        collection_no:'1', collection_date: moment().format('YYYY-MM-DD'), 
        member_type: params.member_type, collection_type: params.collection_type, 
        collection_amount: params.collection_amount, payment_mode: params.payment_mode,
        payment_status: 'Paid', visitor_name: params.visitor_name,attendance_type:params.attendance_type,
        contact_detail: params.contact_detail, created_by:req.userId, modified_by:req.userId
    };
     
    try {
        var addlogQuery = "insert into collection_log SET ?";
        const getSettings = 'select * from settings';
        var updatelogQuery = "update collection_log SET ? where member_id=? and week_date=?";
        const checkPaymentLog = 'SELECT * FROM collection_log where member_id=? and week_date=?';
        
        const checkPaymentAmtLog = 'SELECT * FROM collection_log where amount >0 and member_id=? and week_date=?';
        await Promise.all(
            params.Members.map(mem_val => {
        mysqlConnection.query(checkPaymentLog, [mem_val.member_id,moment(params.weekDay,'DD-MM-YYYY').format('YYYY-MM-DD')], (err, check_rows, fields) => {     
            if (!err) {
                if(check_rows !=''){
                    let logdata = {attendance: mem_val.attendance_type };
                  
                    mysqlConnection.query(updatelogQuery, [logdata,mem_val.member_id,moment(params.weekDay,'DD-MM-YYYY').format('YYYY-MM-DD')], (err, log_rows, fields) => {
                        if (!err) {
                            // let response = {
                            //     "status": APIResponse.Success,
                            //     "message": "Collection has been updated successfully..!"
                            // }
                            // res.send(response);
                        }});
                }
                else{
                    mysqlConnection.query(getSettings, [], (err, settingsRow, fields) => {
                        if (!err) {
               
                let logdata = {collection_id: 0, amount: 0,
                    week_date: moment(params.weekDay,'DD-MM-YYYY').format('YYYY-MM-DD'),
                    weekly_status: 'Unpaid',attendance: mem_val.attendance_type,
                    payable_amount: settingsRow[0].Weekly_fees,member_id: mem_val.member_id,
                     };
                    mysqlConnection.query(addlogQuery, logdata, (err, log_rows, fields) => {
                        if (!err) {
                            // let response = {
                            //     "status": APIResponse.Success,
                            //     "message": "Collection has been updated successfully..!"
                            // }
                            // res.send(response);
                        }});
                    }
                });
            }
        }
       
        });     
    })
    );
    let response = {
        "status": APIResponse.Success,
        "message": "Collection has been updated successfully..!"
    }
    res.send(response);
    } catch (error) {
        let response = {
            "status": APIResponse.ServerError,
            "message": error
        }
        res.send(response);
    }

});

module.exports = Router;