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



Router.post("/", (req, res) => {
    let params = req.body;
    
     
    try {
        var addlogQuery = "insert into collection_log SET ?";
        var addMemberQuery = "insert into collection_entry SET ?";
        const getMemberList = "SELECT * FROM member_master where member_id not in ('31','25','7','27','20','48','32','11','41','34','8','47','23')";       
        mysqlConnection.query(getMemberList, [], (err, check_rows, fields) => {     
            if (!err) {
                if(check_rows !=''){
                    check_rows.forEach(function (members) {

                    for(const val of params.Dates) {    
                        let data = {secretory_id: 1, member_id: members.member_id, 
                            collection_no:'1', collection_date: moment().format('YYYY-MM-DD'), 
                            member_type: params.member_type, collection_type: params.collection_type, 
                            collection_amount: params.collection_amount, payment_mode: params.payment_mode,
                            payment_status: 'Paid', visitor_name: params.visitor_name,attendance_type:'PRESENT',
                            contact_detail: params.contact_detail, created_by:1, modified_by:1
                        };          
                        
                        mysqlConnection.query(addMemberQuery, data, (err, rows, fields) => {
                            if (!err) {
                                var collect_id=rows.insertId;    
                                let  logdata = {collection_id: collect_id, amount:700, week_date: val, weekly_status: 'Paid', payable_amount: 700,member_id: members.member_id  };
                                mysqlConnection.query(addlogQuery, logdata, (err, log_rows, fields) => {
                                                if (!err) {
                                                }
                                });
                            }
                        });

                             
                    }
                });
                }
              
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