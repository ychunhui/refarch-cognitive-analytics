/**
 * Copyright 2018 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 /**
 Delegate to a customer churn scoring service.
 Update 02/09/2018
 */

const request = require('request')
const btoa = require("btoa")
var customerService = require('./customerProxy')

 var buildOptions=function(met,aPath,config){
   return {
     url: config.customerAPI.url+aPath,
   //  path:apath,
     method: met,
     rejectUnauthorized: true,
     //ca: caCerts,
     headers: {
       accept: 'application/json',
       'Content-Type': 'application/json',
       Host: config.churnScoringAPI.host,
     }
   }
 }

 var processRequest = function(res,opts) {
   console.log(`processing request to url [${opts.method}]:`, JSON.stringify(opts))
   request(opts,
       function (error, response, body) {
         if (error) {
           console.error("Process Request Error: "+error);
           return res.status(500).send({error:error});
         }
         res.send(body);
       }
      );
 }

 var mapData = function(sentiment,custRecord){
   var record = [];
   record.push(sentiment);
   record.push("none");
   record.push("none");
   record.push(custRecord.id.toString());
   record.push(custRecord.gender);
   record.push(custRecord.children);
   record.push(custRecord.estimatedIncome);
   if (custRecord.carOwner === "T") {
     record.push("Y");
   } else {
     record.push("N");
   }

   record.push(custRecord.age);
   record.push(custRecord.maritalStatus);
   record.push("95051"); // TODO need to get zipcode in backend
   record.push(custRecord.longDistance);
   record.push(custRecord.international);
   record.push(custRecord.local);
   record.push(custRecord.longDistance);
   record.push(custRecord.dropped);
   record.push(custRecord.paymentMethod);
   record.push(custRecord.localBillType);
   record.push(custRecord.longDistanceBillType);
   record.push(custRecord.usage);
   record.push(custRecord.ratePlan);
   const devices = custRecord.devicesOwned;
   record.push(devices[0].productName);
   record.push("None"); // TODO need to get  preference
   record.push("Y"); // TODO need to get OMPN
   record.push(1220); // TODO need to get SMScount
   return record;
 }


var getScoring = function(config,data){
  request({
    url:config.scoringService.baseUrl+ "/v3/identity/token",
    method: "GET",
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json;charset=UTF-8',
      Authorization: "Basic " + btoa(config.scoringService.username + ":" + config.scoringService.password)
    }},
   function(error,response,body){
        const token=JSON.parse(body).token;
        console.log("Got the token... call the scoring "+body);
        // now call the scoring
        var payload = {"fields": ["Sentiment", "Keyword_Component", "Keyword_Query", "ID", "Gender", "Children", "Income", "CarOwnership", "Age", "MaritalStatus", "zipcode", "LongDistance", "International", "Local", "Dropped", "Paymethod", "LocalBilltype", "LongDistanceBilltype", "Usage", "RatePlan", "DeviceOwned", "Preference", "OMPN", "SMSCount"]};
        payload.values=new Array(data);
        console.log(JSON.stringify(payload));
        const scoring_url = config.scoringService.baseUrl+config.scoringService.instance;
        request({url:scoring_url,
              method:"POST",
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json;charset=UTF-8',
                Authorization: 'Bearer '+token
              },
              body: JSON.stringify(payload)
            },function(error,response,body){
                const result = JSON.parse(body)
                console.log(result)
                const churnIdx=result.values[0][43]
                const churn=result.values[0][44]
                console.log(churn+" "+result.values[0][42][churnIdx])
                return result.values[0][42][churnIdx]
              }
        )
  })
}

 module.exports = {
   scoreCustomer : function(config,req,next){
     console.log("Call churn scoring service for "+JSON.stringify(req.user));
     customerService.getCustomerDetail(config,req.user.email).then(function(response) {
       console.log("Get customer data:"+response)
       // do data preparation
       const toScore=mapData(req.body.context["ToneAnalysisResponse"].tone_id,JSON.parse(response))
       // call the WML service
       console.log("data:"+toScore)
       const score = getScoring(config,toScore);
       next({"score":score})
     }).catch(function(error){
       console.error(error)
     })
   }
} // exports
