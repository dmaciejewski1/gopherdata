/*****************************************************************
  NAME: gopher-connect.js
  PATH: /lib/gopher-connect.js
  WHAT: Functions that facilitate data transactions between this
        module and the Node Oracle Database driver "oracledb".
******************************************************************/
"use strict";
const os = require('os');
const oracledb = require('oracledb');
const gopherTime = require('./gopher-time.js');
const gopherResponse = require('./gopher-response.js');
const gopherTools = require('./gopher-tools')

/******************************************************************
Close a Database connection
*******************************************************************/
function closeConnection(connection, callback){
  connection.release(
    function(err) {
      if (err) {return callback(err,'Connection termination error');}
      return callback(undefined,'Connection closed');
    }
  )
}

/*****************************************************************
Open connection, send Db Statement, recieve info, close connection
******************************************************************/
exports.runTransaction = function (connectionObject,transactionObject,callback) {

  //set connection start time
  Object.assign(transactionObject,{"startTimeObject": gopherTime.getDateObject()});

  let transactionConfig = {};
  let asJSON = 0;
  let bindVariableNames;
  let bindVariablesPresent;

  //build connection string and append to connectionObject
  gopherTools.setConnectionString(connectionObject,function(err){return callback(err,'ERROR');})

//PERFORM SOME VALIDATAION OF INPUTS and SOME dbStatement PREP....
  //if a dbStatement is present in the transactionObject...
  if (transactionObject.dbStatement){
     //parse the string for Bind Variables...
     gopherTools.fetchBindVariableNames(
       transactionObject.dbStatement,
       function(err,res){
         //if error...handle
         if (err) {return callback(err,'ERROR');}
         //set bindVariableNames array
         bindVariableNames = res;
         //if bindVariableNames, then bindVariablesPresent = true, else false
         if (bindVariableNames) {
           bindVariablesPresent = true;
         }else{
           bindVariableNames = [];
           bindVariablesPresent = false;
         }
       }
     )
  }else{
    return callback('The Transaction is missing a Statement to send to the Database','ERROR');
  }

  //if bind variables exist in the dbStatement but not are not explcitly set in the
  //transactionObject.bindVariables property, throw error before sending to Database
  if (bindVariablesPresent === true && Object.keys(transactionObject.bindVariables).length <1){
    let errMsg = 'One or more of the following bind variables not set: '+ bindVariableNames;
    //set connnection end time
    Object.assign(transactionObject,{"endTimeObject": gopherTime.getDateObject()});
    //set properties for error response and append to transactionObject
    Object.assign(transactionObject,{"error":{"errType":'gophErr!',"errMsg":errMsg}});
    //pass to gopherResponse
    return gopherResponse(connectionObject, transactionObject, 'ERROR')
            .then((gophRes)=>{callback(errMsg,gophRes)})
            .catch((gophErr)=>{callback(gophErr,'ERROR')})
  }else if (bindVariablesPresent === false && Object.keys(transactionObject.bindVariables).length >0){
    let errMsg = 'Bind variables set, but none exist within the database statement';
    //set connnection end time
    Object.assign(transactionObject,{"endTimeObject": gopherTime.getDateObject()});
    //set properties for error response and append to transactionObject
    Object.assign(transactionObject,{"error":{"errType":'gophErr!',"errMsg":errMsg}});
    //pass to gopherResponse
    return gopherResponse(connectionObject, transactionObject, 'ERROR')
            .then((gophRes)=>{callback(errMsg,gophRes)})
            .catch((gophErr)=>{callback(gophErr,'ERROR')})
  }


  //if bind vars in bindVariableNames (retrieved from the dbStatement above) do not match the
  //keys in transactionObject.bindVariables, and are not in the same order as bindVariableNames,
  //throw error before sending to Database
  if (Object.keys(transactionObject.bindVariables).length === bindVariableNames.length){
    for(var i = 0; i<bindVariableNames.length; i++) {
      var bVN = bindVariableNames[i];
      var bVO = Object.getOwnPropertyNames(transactionObject.bindVariables)[i];
      if (bVN !== bVO){
        var errMsg = 'Bind variable names set do not match the names in the database statement';
        //set connnection end time
        Object.assign(transactionObject,{"endTimeObject": gopherTime.getDateObject()});
        //set properties for error response and append to transactionObject
        Object.assign(transactionObject,{"error":{"errType":'gophErr!',"errMsg":errMsg}});
        //pass to gopherResponse
        return gopherResponse(connectionObject, transactionObject, 'ERROR')
                .then((gophRes)=>{callback(errMsg,gophRes)})
                .catch((gophErr)=>{callback(gophErr,'ERROR')})
      }
    }
  }else{
    var errMsg = 'The number of bind variables set does not match the number of bind variables in the database statement';
    //set connnection end time
    Object.assign(transactionObject,{"endTimeObject": gopherTime.getDateObject()});
    //set properties for error response and append to transactionObject
    Object.assign(transactionObject,{"error":{"errType":'gophErr!',"errMsg":errMsg}});
    //pass to gopherResponse
    return gopherResponse(connectionObject, transactionObject, 'ERROR')
            .then((gophRes)=>{callback(errMsg,gophRes)})
            .catch((gophErr)=>{callback(gophErr,'ERROR')})
  }


 //set transactionObject properties (to be sent to the oracle driver)
 for (var key in transactionObject) {
   if (transactionObject.hasOwnProperty(key)) {
     if (key === "maxRowsReturned") {Object.assign(transactionConfig,{"maxRows":transactionObject[key]});}// maxRowsReturned = transactionObject[key];}
     if (key === "outputFormat") {
       if (transactionObject[key] === 'array'){Object.assign(transactionConfig,{"outFormat": oracledb.ARRAY});}
       if (transactionObject[key] === 'object'){Object.assign(transactionConfig,{"outFormat":oracledb.OBJECT});}
       if (transactionObject[key] === 'json'){asJSON = 1; Object.assign(transactionConfig,{"outFormat":oracledb.OBJECT});}
     }
   }
 }

 //---------INITIATE DB TRANSACTION-----------
  oracledb.getConnection(
    connectionObject,
    function(err, oraConnect) {
      //Handle "getConnection" Errors
      if (err) {callback(err,'ERROR');}
      oraConnect.execute(
        transactionObject.dbStatement,
        transactionObject.bindVariables,
        transactionConfig,
        function (oraErr, dbResponse) {

          //if oracle errors...
          if (oraErr) {
              //set connnection end time
              Object.assign(transactionObject,{"endTimeObject": gopherTime.getDateObject()});
              //set properties for error response and append to transactionObject
              Object.assign(transactionObject,{"error":{"errType":'oracle',"errMsg": oraErr.toString()}});
              //pass to gopherResponse
              return gopherResponse(connectionObject, transactionObject, 'ERROR')
                      .then((gophRes)=>{callback(oraErr,gophRes);})
                      .catch((gophErr)=>{callback(gophErr,'ERROR');})
          }
          //Close database connection
          closeConnection(oraConnect,function(closeConnectionErr,closeConnectionRes){
            //Handle connection termination errors...
            if(closeConnectionErr){
              Object.assign(transactionObject,{"endTimeObject": gopherTime.getDateObject()});
              Object.assign(transactionObject,{"error":{"errType":'oracle',"errMsg": closeConnectionErr}});
              return gopherResponse(connectionObject, transactionObject, 'ERROR')
                      .then((gophRes)=>{callback(closeConnectionErr,gophRes)})
                      .catch((gophErr)=>{callback(gophErr,'ERROR')})
            }
            //set connnection end time
            Object.assign(transactionObject,{"endTimeObject": gopherTime.getDateObject()});
            return gopherResponse(connectionObject, transactionObject, dbResponse)
                    .then((gophRes)=>{callback(undefined,gophRes)})
                    .catch((gophErr)=>{callback(gophErr,'ERROR')})
          });
        }
    );
    }
  );
}
