const express = require("express");
const Router = express.Router();
var mysqlConnection = require('../../connection');
var VerifyToken = require('./VerifyToken');
var moment = require('moment');  

const APIResponse = {
    Success: 0,
    Failed: 1,
    ServerError: 2
}

const getUnPaidMemberList = 'select * from member_master where status=1 and member_master.member_id not in (select collection_entry.member_id from collection_entry JOIN collection_log on collection_log.collection_id=collection_entry.collection_id where collection_log.week_date=?);';
const getSettings = 'select * from settings';
const getMemberList = 'select * from member_master where status=1';


Router.post("/",VerifyToken, (req, res) => {
    // console.log(req);
    let params = req.query;
    
    mysqlConnection.query(getMemberList, [], (err, memberRows, fields) => {
        if (!err) {
            mysqlConnection.query(getSettings, [], (err, settingsRow, fields) => {
                if (!err) {
                    var weekdate=moment(params.weekDay, 'DD-MM-YYYY').format('YYYY-MM-DD');
                   
                    var start = moment(weekdate, 'YYYY-MM-DD').format('YYYY-MM-DD'), // Sept. 1st
                    end   = moment(weekdate, 'YYYY-MM-DD').endOf('month').format('YYYY-MM-DD');
                      
                    var remainingmonth = 0;
                    while (moment(start,'YYYY-MM-DD').isSameOrBefore(moment(end),'YYYY-MM-DD')) {
                        if(moment(start,'YYYY-MM-DD').weekday() == 4){
                            remainingmonth++;
                        }
                        
                        start=moment(start,'YYYY-MM-DD').add(1, 'days').format('YYYY-MM-DD');
                    }
                  
                    settingsRow[0].monthly_fees =remainingmonth*settingsRow[0].Weekly_fees;
                  
                mysqlConnection.query(getUnPaidMemberList, [weekdate], (err, unpaidRows, fields) => {
                    if (!err) {

                        let response = {
                            "status": APIResponse.Success,
                            // "memberList": memberRows,
                            // "unpaidMemberList": unpaidRows,
                            "paymentDetails": settingsRow,
                        }
                        res.send(response);

                    }else{
                        let response = {
                            "status": APIResponse.Success,
                            // "memberList": memberRows,
                            // "unpaidMemberList": [],
                            "paymentDetails": settingsRow,
                        }
                        res.send(response);
                    }
                });
          

        }
        else {
            let response = {
                "status": APIResponse.ServerError,
                "memberList": []
            }
            res.send(response);
        }
    });

        } else {
            let response = {
                "status": APIResponse.ServerError,
                "memberList": [],
                "unpaidMemberList": [],
            }
            res.send(response);
        }
    });
});

module.exports = Router;