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



Router.post("/",VerifyToken, (req, res) => {
    let params = req.body;
    let data = {secretory_id: req.userId, member_id: params.member_id, 
        collection_no:'1', collection_date: moment().format('YYYY-MM-DD'), 
        member_type: params.member_type, collection_type: params.collection_type, 
        collection_amount: params.collection_amount, payment_mode: params.payment_mode,
        payment_status: 'Paid', visitor_name: params.visitor_name,attendance_type:params.attendance_type,
        contact_detail: params.contact_detail, created_by:req.userId, modified_by:req.userId
    };
     
    try {
        var addMemberQuery = "insert into collection_entry SET ?";
        var updateMemberQuery = "update collection_entry SET ? where collection_id=?";
        var deletelogQuery = "delete from collection_log where collection_id=?";
        var addlogQuery = "insert into collection_log SET ?";
        const getSettings = 'select * from settings';
        var updatelogQuery = "update collection_log SET ? where member_id=? and week_date=?";
        const checkPaymentLog = 'SELECT * FROM collection_log where member_id=? and week_date=?';
        
        const checkPaymentAmtLog = 'SELECT * FROM collection_log where amount >0 and member_id=? and week_date=?';
       
        if(params.collection_id==0 && params.pay_type==1 && params.member_type =="VISITOR"){  
            mysqlConnection.query(addMemberQuery, data, (err, rows, fields) => {
                if (!err) {
                    let response = {
                        "status": APIResponse.Success,
                        "message": "Collection has been added successfully..!"
                    }
                    res.send(response);
                }
                
            });
        }else{
        mysqlConnection.query(checkPaymentAmtLog, [params.member_id,moment(params.weekDay,'DD-MM-YYYY').format('YYYY-MM-DD')], (err, check_rows, fields) => {     
            if (!err) {
                if(check_rows !=''){
                    let logdata = {attendance: params.attendance_type };
                  
                    mysqlConnection.query(updatelogQuery, [logdata,params.member_id,moment(params.weekDay,'DD-MM-YYYY').format('YYYY-MM-DD')], (err, log_rows, fields) => {
                        if (!err) {
                            let response = {
                                "status": APIResponse.Success,
                                "message": "Collection has been updated successfully..!"
                            }
                            res.send(response);
                        }});
                }
                else{
                    mysqlConnection.query(getSettings, [], (err, settingsRow, fields) => {
                        if (!err) {
               
        if(params.collection_id==0 && params.pay_type==1){  
            mysqlConnection.query(addMemberQuery, data, (err, rows, fields) => {
                if (!err) {
                    var collect_id=rows.insertId;
                    if(params.member_type =="MEMBER" && params.collection_type =="MONTHLY"){
                      
                        var weekdate=moment(params.weekDay, 'DD-MM-YYYY').format('YYYY-MM-DD');
                   
                        var start = moment(weekdate, 'YYYY-MM-DD').format('YYYY-MM-DD'), 
                        end   = moment(weekdate, 'YYYY-MM-DD').endOf('month').format('YYYY-MM-DD');
                      
                        while (moment(start,'YYYY-MM-DD').isSameOrBefore(moment(end),'YYYY-MM-DD')) {
                            if(moment(start,'YYYY-MM-DD').weekday() == 4){
                                let logdata = {collection_id: collect_id, amount: settingsRow[0].Weekly_fees,
                                    week_date: start, weekly_status: 'Paid',attendance: '',
                                    payable_amount: settingsRow[0].Weekly_fees,member_id: params.member_id
                                };
                                mysqlConnection.query(addlogQuery, logdata, (err, log_rows, fields) => {
                                    if (!err) {
                                    }});
                                }
                                start=moment(start,'YYYY-MM-DD').add(1, 'days').format('YYYY-MM-DD');
                            }
                      
                    }else if(params.member_type =="MEMBER" && params.collection_type =="WEEKLY"){
                        let logdata = {collection_id: collect_id, amount: params.collection_amount,
                            week_date: moment(params.weekDay,'DD-MM-YYYY').format('YYYY-MM-DD'),
                            weekly_status: 'Paid',attendance: params.attendance_type,
                            payable_amount: settingsRow[0].Weekly_fees,member_id: params.member_id,
                             };
                            mysqlConnection.query(addlogQuery, logdata, (err, log_rows, fields) => {
                                if (!err) {
                                }});
                    }else if(params.member_type =="MEMBER" && params.collection_type =="OUTSTANDING"){
                        for(const val of params.Dates) {
                        mysqlConnection.query(checkPaymentLog, [params.member_id,val], (err, log_rows, fields) => {                                   
                            if (!err) {
                                if(log_rows !=''){
                                    let logdata = {collection_id: collect_id, amount: log_rows[0].payable_amount, weekly_status: 'Paid' };
                                    mysqlConnection.query(updatelogQuery, [logdata,params.member_id,val], (err, log_rows, fields) => {
                                        if (!err) {
                                        }});
                                }
                                else{
                                    let logdata;
                                    if(moment(params.weekDay,'DD-MM-YYYY').format('YYYY-MM-DD')==val){
                                         logdata = {collection_id: collect_id, amount: settingsRow[0].Weekly_fees,
                                            week_date: val,
                                            weekly_status: 'Paid',attendance: params.attendance_type,
                                            payable_amount: settingsRow[0].Weekly_fees,member_id: params.member_id,
                                            };
                                    }else{
                                         logdata = {collection_id: collect_id, amount: settingsRow[0].Weekly_fees,
                                            week_date: val, weekly_status: 'Paid',
                                            payable_amount: settingsRow[0].Weekly_fees,member_id: params.member_id,
                                            };
                                    }
                                    
                                    mysqlConnection.query(addlogQuery, logdata, (err, log_rows, fields) => {
                                        if (!err) {
                                        }
                                    });
                                }
                            }
                            
                           
                        });  
                    }
                    } 
                  let response = {
                      "status": APIResponse.Success,
                      "message": "Collection has been added successfully..!"
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
            } else if(params.collection_id==0 && params.pay_type==2){
                let logdata = {collection_id: 0, amount: 0,
                    week_date: moment(params.weekDay,'DD-MM-YYYY').format('YYYY-MM-DD'),
                    weekly_status: 'Unpaid',attendance: params.attendance_type,
                    payable_amount: settingsRow[0].Weekly_fees,member_id: params.member_id,
                     };
                    mysqlConnection.query(addlogQuery, logdata, (err, log_rows, fields) => {
                        if (!err) {
                            let response = {
                                "status": APIResponse.Success,
                                "message": "Collection has been updated successfully..!"
                            }
                            res.send(response);
                        }});
            }
        }
    });
        }
    }
    
});
    }
        //     else {
        //     mysqlConnection.query(updateMemberQuery, [data,params.collection_id], (err, rows, fields) => {
        //         if (!err) {
        //             var collect_id=params.collection_id;
        //             mysqlConnection.query(deletelogQuery, collect_id, (err, rows, fields) => {
        //                 if (!err) {
        //             if(params.member_type =="MEMBER" && params.collection_type =="MONTHLY"){
        //                 mysqlConnection.query(getSettings, [], (err, settingsRow, fields) => {
        //                     if (!err) {
        //                 var weekdate=moment(params.weekDay, 'DD-MM-YYYY').format('YYYY-MM-DD');
                   
        //                 var start = moment(weekdate, 'YYYY-MM-DD').format('YYYY-MM-DD'), 
        //                 end   = moment(weekdate, 'YYYY-MM-DD').endOf('month').format('YYYY-MM-DD');
                      
        //                 while (moment(start,'YYYY-MM-DD').isSameOrBefore(moment(end),'YYYY-MM-DD')) {
        //                     if(moment(start,'YYYY-MM-DD').weekday() == 4){
        //                         let logdata = {collection_id: collect_id, amount: settingsRow[0].Weekly_fees,
        //                             week_date: moment(start,'DD-MM-YYYY').format('YYYY-MM-DD')
        //                         };
        //                         mysqlConnection.query(addlogQuery, logdata, (err, log_rows, fields) => {
        //                             if (!err) {
        //                             }});
        //                         }
        //                         start=moment(start,'YYYY-MM-DD').add(1, 'days').format('YYYY-MM-DD');
        //                     }
                            
        //                 }
        //             });
        //             }else if(params.member_type =="MEMBER" && params.collection_type =="WEEKLY"){
        //                 let logdata = {collection_id: collect_id, amount: params.collection_amount,
        //                     week_date: moment(params.weekDay,'DD-MM-YYYY').format('YYYY-MM-DD')
        //                      };
        //                     mysqlConnection.query(addlogQuery, logdata, (err, log_rows, fields) => {
        //                         if (!err) {
        //                         }});
        //             }
        //           let response = {
        //               "status": APIResponse.Success,
        //               "message": "Collection has been updated successfully..!"
        //           }
        //           res.send(response);
        //             }});
        //         } else {
        //             let response = {
        //                 "status": APIResponse.ServerError,
        //                 "message": err
        //             }
        //             res.send(response);
        //         }
        //     });
        // }
    } catch (error) {
        let response = {
            "status": APIResponse.ServerError,
            "message": error
        }
        res.send(response);
    }
});

module.exports = Router;