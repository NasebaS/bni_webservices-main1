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

const getMemberList = 'SELECT * FROM settings';

Router.get("/", VerifyToken, (req, res) => {
    mysqlConnection.query(getMemberList, [], (err, memberRows, fields) => {
        console.log(memberRows);
        if (!err) {
          
            var start = moment(memberRows[0].collection_start_date).format('YYYY-MM-DD'), // Sept. 1st
            end   = moment(moment()).add(7, 'days').format('YYYY-MM-DD'); // Nov. 2nd
            var result = [];
            while (moment(start,'YYYY-MM-DD').isSameOrBefore(moment(end),'YYYY-MM-DD')) {
                if(moment(start,'YYYY-MM-DD').weekday() == 4){
                    result.push(moment(start,'YYYY-MM-DD').format('DD-MM-YYYY'));
                }
                start=moment(start,'YYYY-MM-DD').add(1, 'days').format('YYYY-MM-DD');
            }

          let response = {
              "status": APIResponse.Success,
              "memberList": result.reverse()
          }
          res.send(response);

        } else {
            let response = {
                "status": APIResponse.ServerError,
                "memberList": []
            }
            res.send(response);
        }
    });
});

module.exports = Router;