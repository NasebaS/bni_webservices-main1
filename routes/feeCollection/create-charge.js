var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
const http = require('http');

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.post("/", (req, res) => {
 
    let data = '';
    let params = req.body;
    const options = {
        hostname: 'api.tap.company',
        path: 'https://api.tap.company/v2/charges',
        method: 'POST', 
        headers: {
            'Content-Type': 'application/json',  
            'Authorization': 'Bearer sk_test_XKokBfNWv6FIYuTMg5sLPjhJ',
        }
    };
    const request = http.request(options, (response) => {
      response.setEncoding('utf8');
  
      response.on('data', (chunk) => {
        data += chunk;
      });
  
      response.on('end', () => {
        console.log(data);
        let response = {
          "status": 0,
          "data":data
      }
      res.send(response);
      });
    });  
    request.on('error', (error) => {
      console.error(error);
    });
    
var postData = JSON.stringify({
  "amount": "15",
  "currency": "SAR",
  "threeDSecure": true,
  "save_card": false,
  "description": "home nursing",
  "statement_descriptor": "Taib",
  "metadata": {"udf1": "test 1" },
  "reference": { "transaction": "txn_0001", "order": "123456123" },
  "receipt": { "email": true, "sms": true },
  "customer": {
    "first_name": "Mani",
    "middle_name": "-",
    "last_name": "-",
    "email": "backenddeveloper2@taib.sa",
    "phone": { "country_code": "966", "number": "543215432" }
  },
  "merchant": { "id": "" },
  "source": { "id": "src_all"  },
  "post": {"url": "http://your_website.com/posturl"  },
  "redirect": { "url": "http://localhost:4200/#/payment-status?currency=SAR&price=200"  } 
  });

  request.write(postData);
   
    request.end(); 

});

module.exports = router;

