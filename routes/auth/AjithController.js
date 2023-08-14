var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var constants = require('../../config');
var mysqlConnection = require('../../connection');

// var VerifyToken = require('./VerifyToken');

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

/**
 * Configure JWT
 */
var jwt = require('jsonwebtoken'); 
var bcrypt = require('bcryptjs');
const loginstat = {
  Success: 0,
  Failed: 1,
  ServerError: 2
}

var findusername = "select secretory_id, image_path, DATE_FORMAT(start_date, '%b %Y') as start_date, DATE_FORMAT(end_date, '%b %Y') as end_date, secretory_master.status, member_name from secretory_master join member_master on member_master.member_id=secretory_master.member_id  where user_name=? and password=?";

router.post("/", (req, res) => {
     // console.log(req);
    // res.send(req.query);
  let params = req.body;
//   let response = {
//     "details":params 
// }
// res.send(response);
    
  try {
      if (params.user_name == null) {
          let response = {
              "status": loginstat.Failed,
              "message": "username can't be empty."
          }
          res.send(response);
      } else if (params.password == null) {
          let response = {
              "status": loginstat.Failed,
              "message": "Password can't be empty."
          }
          res.send(response);
      
      } else {
       
          mysqlConnection.query(findusername, [params.user_name, params.password], (err, rows, fields) => {
           
            if (!err) {
                if(rows.length >0){
                var _id = rows[0].secretory_id;
                var token = jwt.sign({ id: _id.toString() }, constants.secret, {
                  expiresIn: 86400 // expires in 24 hours
                });
                
                  let response = {
                      "status": loginstat.Success,
                      "details":{
                        "user_id": 1,
                        "user_name": params.user_name,
                        "password": params.password,
                        "token": token,
                        "mobile_no": "14214515915",
                        "email": "test@gmail.com"
                    },
                      "message": ""
                  }
                  res.send(response);
                }else{
                    let response = {
                        "status": loginstat.Failed,
                        "message": "Invalid login credentials....!"
                    }
                    res.send(response);
                }
            
              } else {
                  let response = {
                      "status": loginstat.ServerError,
                      "message": err.errorDescription
                  }
                  res.send(response);
              }
          });
      }
  } catch (error) {
      let response = {
          "status": loginstat.ServerError,
          "message": error
      }
      res.send(response);
  }
});

module.exports = router;