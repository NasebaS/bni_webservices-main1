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

const getMemberList = 'SELECT * FROM member_master where member_id=? order by member_name ASC';
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
                    while(moment(weekdate,'YYYY-MM-DD') <= moment(moment()).endOf('month')){
                        var details = new Object();
                        details.Description=moment(weekdate,'YYYY-MM-DD').format('MMM') + " Month";
                        details.PaidAmount=''; 
                        details.type=1;
                        details.orderno=moment(weekdate,'YYYY-MM-DD').format('YYYYMMDD');
                        details.MonthlyAmount=getAmountOfWeekDaysInMonth(moment(weekdate,'YYYY-MM-DD'),4) * settingsRow[0].Weekly_fees;
                        
                        arraylist.push(details);
                 
                        var start = moment(weekdate, 'YYYY-MM-DD').startOf('month').format('YYYY-MM-DD'), 
                        end   = moment(weekdate, 'YYYY-MM-DD').endOf('month').format('YYYY-MM-DD');
                        
                        while (moment(start,'YYYY-MM-DD').isSameOrBefore(moment(end),'YYYY-MM-DD')) {
                            if(moment(start,'YYYY-MM-DD').weekday() == 4){
                                let sdate=start;
                                console.log(sdate);
                                mysqlConnection.query(checkPaymentLog, [params.member_id,sdate], (err, log_rows, fields) => {

                                    if (!err) {
                                        if(log_rows !=''){
                                            var details_log = new Object();
                                            details_log.Description=moment(sdate,'YYYY-MM-DD').format('Do MMM');
                                            details_log.PaidAmount=log_rows[0].amount;
                                            details_log.MonthlyAmount='';
                                            details_log.type=0;
                                            details_log.orderno=moment(sdate,'YYYY-MM-DD').format('YYYYMMDD');
                                            arraylist.push(details_log);
                                        }
                                        else{

                                            var details_log = new Object();
                                            details_log.Description=moment(sdate,'YYYY-MM-DD').format('Do MMM');
                                            details_log.PaidAmount=0;
                                            details_log.MonthlyAmount='';
                                            details_log.type=0;
                                            details_log.orderno=moment(sdate,'YYYY-MM-DD').format('YYYYMMDD');
                                            arraylist.push(details_log);   
                                        }
                                    } else{
                                        var details_log = new Object();
                                        details_log.Description=moment(sdate,'YYYY-MM-DD').format('Do MMM');
                                        details_log.PaidAmount=0;
                                        details_log.MonthlyAmount='';
                                        details_log.type=0;
                                        details_log.orderno=moment(sdate,'YYYY-MM-DD').format('YYYYMMDD');
                                        arraylist.push(details_log);
                                    }});
                                   
                                }
                                start=moment(start,'YYYY-MM-DD').add(1, 'days').format('YYYY-MM-DD');
                            }
                            weekdate=start;
                        }
                        // console.log(arraylist);
                        setTimeout(() => {  
                            arraylist.sort((a, b) => a.orderno - b.orderno);
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