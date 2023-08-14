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

const getMemberList = 'SELECT * FROM member_master order by member_name ASC';
const getSettingsList = 'SELECT * FROM settings';
const getSecretoryList = 'SELECT * FROM secretory_master where secretory_id=?';
const checkPaymentLog = "SELECT sum(collection_amount) as paidamount from collection_entry where member_type='MEMBER' and member_id=? and secretory_id=?";
function getAmountOfWeekDaysInMonth(date, weekday) {
    date.date(1);
    var dif = (7 + (weekday - date.weekday())) % 7 + 1;
    return Math.floor((date.daysInMonth() - dif) / 7) + 1;
}

Router.post("/", VerifyToken, (req, res) => {
    let params = req.body;
    let arraylist=[];
    mysqlConnection.query(getMemberList, params.member_id, (err, memberRows, fields) => {
        if (!err) {
            mysqlConnection.query(getSettingsList, [], (err, settingsRow, fields) => {
                if (!err) {
                    var weekdate=memberRows[0].app_start_date;
                    var start = moment(weekdate, 'YYYY-MM-DD').startOf('month').format('YYYY-MM-DD'), 
                    end   = moment(moment()).endOf('month').format('YYYY-MM-DD');
                    var monthcount=0; var totalincome=0
                    while (moment(start,'YYYY-MM-DD').isSameOrBefore(moment(end),'YYYY-MM-DD')) {
                        if(moment(start,'YYYY-MM-DD').weekday() == 4)
                            monthcount++;                                
                        start=moment(start,'YYYY-MM-DD').add(1, 'days').format('YYYY-MM-DD');
                    }
                    totalincome=monthcount*settingsRow[0].Weekly_fees;
                    memberRows.forEach(function (members) {
                       
                        mysqlConnection.query(checkPaymentLog, [members.member_id,req.userId], (err, log_rows, fields) => {
                            if (!err) {
                               
                                if(log_rows !=''){
                                    
                                    var details = new Object();
                                    details.memberName=members.member_name;
                                    details.PaidAmount=log_rows[0].paidamount; 
                                    details.totalAmount=totalincome;
                                    details.balanceAmount=totalincome-log_rows[0].paidamount;
                                    arraylist.push(details);
                                }
                            }
                        });        
                    });
                       
                        setTimeout(() => {  
                        let response = {
                            "status": APIResponse.Success,
                            "LedgerDetails": arraylist,
                            "success":true
                        }                                
                        res.send(response);
                    }, 500);
                          
                } else {
                    let response = {
                        "status": APIResponse.ServerError,
                        "LedgerDetails":[]
                    }
                    res.send(response);
                }
            });

        } else {
            let response = {
                "status": APIResponse.ServerError,
                "LedgerDetails":[]
            }
            res.send(response);
        }
    });
});

module.exports = Router;