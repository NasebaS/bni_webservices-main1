const express = require("express");
const router = express.Router();
const moment = require('moment'); 
var mysqlConnection = require('../../connection');

const APIResponse = {
  Success: 0,
  Failed: 1,
  ServerError: 2
}


router.post("/", (req, res) => {
  const getLedgerReportList = `
    SELECT ledgername, SUM(amount) as amount,refnum,type
    FROM income_expense_entry
  `;
 
  const { fromDate, toDate } = req.body;
  let sqlQuery = getLedgerReportList;

  if (fromDate) {
    sqlQuery += ` WHERE entry_date >= '${fromDate}'`;
  }

  if (toDate) {
    sqlQuery += `${fromDate ? ' AND' : ' WHERE'} entry_date <= '${toDate}'`;
  }

  sqlQuery += ` GROUP BY ledgername`;
 
  mysqlConnection.query(sqlQuery, (err, reportRows) => {
    console.log(sqlQuery)
    if (err) {
      let response = {
        "status": APIResponse.ServerError,
        "ledgerReportList": []
      };
      res.send(response);
    } else {
      let response = {
        "status": APIResponse.Success,
        "ledgerReportList": reportRows
      };
      res.send(response);
    }
  });
});


router.post("/weeklyfee", (req, res) => {
  
  const weeklyfee='SELECT SUM(collection_amount) AS WeeklyFee FROM collection_entry';
  const { fromDate, toDate} = req.body;
  
let myQuery=weeklyfee;
  if (fromDate) {
    // const formattedFromDate = (fromDate).format('YYYY-MM-DD');
  
    myQuery +=` WHERE collection_date>= '${fromDate}'`;
  }

  if (toDate) {
    // const formattedToDate = moment(toDate).format('YYYY-MM-DD');
 
    myQuery += `${fromDate ? ' AND' : ' WHERE'} collection_date <= '${toDate}'`;
  }

 

  mysqlConnection.query(myQuery, (err, reportRows) => {
    console.log(myQuery)
    if (err) {
      let response = {
        "status": APIResponse.ServerError,
        "WeeklyFeeAmountList": ''
      };
      res.send(response);
    } else {
      let response = {
        "status": APIResponse.Success,
        "WeeklyFeeAmountList": reportRows
      };
      res.send(response);
    }
  });
});

module.exports = router;
