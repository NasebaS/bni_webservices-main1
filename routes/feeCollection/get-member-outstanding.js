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

const getMemberList = "SELECT *, (SELECT sum(collection_amount) as paidamount from collection_entry where member_type='MEMBER' and collection_entry.member_id=member_master.member_id) as paidamt FROM member_master where member_id=?";
const getSettingsList = 'SELECT * FROM settings';
const checkPaymentLog = 'SELECT * FROM collection_log where member_id=? and week_date=?';
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
                    
                    var outstanding_amt=0;
                    mysqlConnection.query(checkPaymentLog, [params.member_id,params.weekDay], (err, log_rows, fields) => {                                   
                        if (!err) {
                            if(log_rows !='' && log_rows[0].amount>0 ){
                                console.log(log_rows);
                                memberRows[0].currentWeekPaid=1;
                            }
                            else{
                               
                                memberRows[0].currentWeekPaid=2;
                            }
                        }});
                    while(moment(weekdate,'YYYY-MM-DD') <= moment(moment()).endOf('month')){
                                        
                        var start = moment(weekdate, 'YYYY-MM-DD').startOf('month').format('YYYY-MM-DD'), 
                        end   = moment(weekdate, 'YYYY-MM-DD').endOf('month').format('YYYY-MM-DD');
                       
                        while (moment(start,'YYYY-MM-DD').isSameOrBefore(moment(end),'YYYY-MM-DD')) {
                            if(moment(start,'YYYY-MM-DD').weekday() == 4){
                                let sdate=start;
                               
                                mysqlConnection.query(checkPaymentLog, [params.member_id,sdate], (err, log_rows, fields) => {                                   
                                    if (!err) {
                                        if(log_rows !=''){
                                            if(log_rows[0].amount==0){
                                                var details_log = new Object();
                                                details_log.Description=moment(sdate,'YYYY-MM-DD').format('Do MMM');
                                                details_log.PayableAmount=log_rows[0].payable_amount;
                                                details_log.orderno=moment(sdate,'YYYY-MM-DD').format('YYYYMMDD');
                                                details_log.WeekDay=moment(sdate,'YYYY-MM-DD').format('YYYY-MM-DD');;
                                                arraylist.push(details_log);
                                                outstanding_amt+=log_rows[0].payable_amount;
                                            }
                                        }
                                        else{
                                           
                                            var details_log = new Object();
                                            details_log.Description=moment(sdate,'YYYY-MM-DD').format('Do MMM');
                                            details_log.PayableAmount=settingsRow[0].Weekly_fees;
                                            details_log.WeekDay=moment(sdate,'YYYY-MM-DD').format('YYYY-MM-DD');;
                                            details_log.orderno=moment(sdate,'YYYY-MM-DD').format('YYYYMMDD');
                                            arraylist.push(details_log);   
                                        }
                                    }});
                                }
                                start=moment(start,'YYYY-MM-DD').add(1, 'days').format('YYYY-MM-DD');
                            }
                            weekdate=start;
                        }
                        setTimeout(() => {  
                            arraylist.sort((a, b) => a.orderno - b.orderno);
                            memberRows[0].outstanding=outstanding_amt;
                            let response = {
                                "status": APIResponse.Success,
                                "memberList": memberRows,
                                "LedgerDetails": arraylist
                            }                        
                            res.send(response);
                        }, 500);                           
                            
                } else {
                    let response = {
                        "status": APIResponse.ServerError,
                        "memberList": memberRows,
                        "LedgerDetails":[]
                    }
                    res.send(response);
                }
            });

        } else {
            let response = {
                "status": APIResponse.ServerError,
                "memberList": [],
                "LedgerDetails":[]
            }
            res.send(response);
        }
    });
});

module.exports = Router;