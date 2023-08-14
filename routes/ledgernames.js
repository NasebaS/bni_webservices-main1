const express = require('express');
const router = express.Router();
var mysqlConnection = require('../connection');


  const ledgerNames = 'SELECT ledger_name FROM ledger_master ';
  
  router.get("/", (req, res) => {
    mysqlConnection.query(ledgerNames, (err, ledgerRows) => {
      if (err) {
        let response = {
        
          "ledgerList": []
        };
        res.send(response);
      } else {
        let response = {
          
          "ledgerList": ledgerRows
        };
        res.send(response);
      }
    });
  });
  
  module.exports = router;



