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
  const getledgerReportList = 'SELECT * FROM income_expense_entry ';
  const { fromDate, toDate, selectedLedger, selectedType } = req.body;
  let sqlQuery = getledgerReportList;

  if (fromDate) {
    // const formattedFromDate = (fromDate).format('YYYY-MM-DD');
    sqlQuery += ` WHERE entry_date >= '${fromDate}'`;
    
  }

  if (toDate) {
    // const formattedToDate = moment(toDate).format('YYYY-MM-DD');
    sqlQuery += `${fromDate ? ' AND' : ' WHERE'} entry_date <= '${toDate}'`;
  }

  if (selectedLedger !== 'All') {
    sqlQuery += `${fromDate || toDate ? ' AND' : ' WHERE'} ledgername = '${selectedLedger}'`;
  }

  if (selectedType !== 'All') {
    sqlQuery += `${(fromDate || toDate || selectedLedger !== 'All') ? ' AND' : ' WHERE'} type = '${selectedType}'`;
  }
 
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

// Create a new expense entry
// router.post("/", (req, res) => {
//     const { ledger_id,entry_date, refnum, ledgername, type, amount, notes } = req.body;
  
 
//     const formattedEntryDate = entry_date.slice(0, 10);
//     mysqlConnection.query(
//       "INSERT INTO income_expense_entry (ledger_id,entry_date, refnum, ledgername, type, amount, notes) VALUES (?,?, ?, ?, ?, ?, ?)",
//       [ledger_id,formattedEntryDate, refnum, ledgername, type, amount, notes],
//       (err, result) => {
//         if (err) {
//           console.log(err);
//           let response = {
//             "status": APIResponse.ServerError,
//             message: "Error creating Expense entry"
//           };
  
//           res.send(response);
//         } else {
//           let response = {
//             "status": APIResponse.Success,
//             message: "Expense Entry created successfully"
//           };
  
//           res.send(response);
//         }
//       }
//     );
//   });
  
// Update a ledger

// router.put("/:entry_id", (req, res) => {
//   const entry_id = req.params.entry_id;
//   const { ledger_id, entry_date, refnum, ledgername, type, amount, notes } = req.body;

//   mysqlConnection.query(
//     "UPDATE income_expense_entry SET ledger_id=?, entry_date=?, refnum=?, ledgername=?, type=?, amount=?, notes=? WHERE entry_id=?",

//     [ledger_id, entry_date, refnum, ledgername, type, amount, notes,entry_id],
//     (err, result) => {
//       if (err) {
//         console.log(err);
//         let response = {
//           "status": APIResponse.ServerError,
//           message: "Error updating expense entry"
//         };

//         res.status(500).send(response); // Use res.status().send()
//       } else {
//         let response = {
//           "status": APIResponse.Success,
//           message: "Expense Entry updated successfully"
//         };

//         res.send(response);
//       }
//     }
//   );
// });

// Delete a ledger
// router.delete("/:entry_id", (req, res) => {
//   const entry_id = req.params.entry_id;

//   const sqlQuery = "DELETE FROM income_expense_entry WHERE entry_id = ?";


//   mysqlConnection.query(sqlQuery, [entry_id], (err, result) => {
//     if (err) {
     
//       res.status(500).json({ message: "Error Deleting Expense Entry",err });
//     } else {
//       // console.log("Query Result:", result);
//       if (result.affectedRows > 0) {
//         res.status(200).json({ message: "Expense Entry deleted successfully" });
//       } else {
//         res.status(404).json({ message: "No active entries found for deletion" });
//       }
//     }
//   });
// });





module.exports = router;
