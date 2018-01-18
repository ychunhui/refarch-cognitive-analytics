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
 Update 01/18/2018
 */

 var https=require('https');

 const request = require('request')

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


 module.exports = {
   scoreCustomer : function(config,req,res,next){
     //var opts = buildOptions('GET','/c/',config);
     //opts.headers['Content-Type']='multipart/form-data';
     //processRequest(res,opts);
     console.log("Call churn scoring service for "+req.body);
     next({"score":0.77})
   }
} // exports
