/*****************************************************************
  NAME: gopher-response.js
  PATH: /lib/gopher-response.js
******************************************************************/
"use strict";
const os = require('os');
const formatter = require('formattor');
const tools = require('./gopher-tools.js');
const gopherTime = require('./gopher-time.js');


/******************************************************************
Based on properties set in the "connectionObject",
"transactionObject" and "dbResponse" inputs, gopherResponse
assembles an appropriate data response output
*******************************************************************/
function gopherResponse (
  connectionObject,
  transactionObject,
  dbResponse,
  callback){

//set time signature variables for utc or local time----------------------------
    var startTimestamp;
    var endTimestamp
    var startTime;
    var endTime;
    if (transactionObject.timeZone === 'utc' || transactionObject.timeZone === 'UTC'){
      startTimestamp = transactionObject.startTimeObject.utcTime.timestamp;
      endTimestamp = transactionObject.endTimeObject.utcTime.timestamp;
      startTime = transactionObject.startTimeObject.utcTime.datetime;
      endTime = transactionObject.startTimeObject.utcTime.datetime;
    }else if (transactionObject.timeZone === 'local') {
      startTimestamp = transactionObject.startTimeObject.localTime.timestamp;
      endTimestamp = transactionObject.endTimeObject.localTime.timestamp;
      startTime = transactionObject.startTimeObject.localTime.datetime;
      endTime = transactionObject.startTimeObject.localTime.datetime;
    }

//host--------------------------------------------------------------------------
  var host  = {
    "system":os.hostname(),
    "os":os.type(),
    "platform":os.platform(),
    "architecture":os.arch(),
    "osRelease":os.release()
  };

//network-----------------------------------------------------------------------
  var network = {};
  for (var i = 0; i < os.networkInterfaces().lo0.length; i++ ) {
    var test = os.networkInterfaces().lo0[i].family;
    if (test==='IPv4') {
      network = os.networkInterfaces().lo0[i]; //lo0, en0, awdl0, utun0
    }
  }

//connection--------------------------------------------------------------------
  var connection = {};
  for (var key in connectionObject) {
    if (connectionObject.hasOwnProperty(key)) {
      if (key === "user") {Object.assign(connection,{"user":connectionObject[key]});}
      if (key === "host") {Object.assign(connection,{"host":connectionObject[key]});}
      if (key === "port") {Object.assign(connection,{"port":connectionObject[key]});}
      if (key === "service") {Object.assign(connection,{"service":connectionObject[key]});}
      if (key === "SID") {Object.assign(connection,{"SID":connectionObject[key]});}
    }
  }
  Object.assign(connection,{"opened":startTimestamp});
  Object.assign(connection,{"closed":endTimestamp});

//dbStatement-------------------------------------------------------------------
  var dbStatement = {};
  var prettySQL;
  for (var key in transactionObject) {
    if (transactionObject.hasOwnProperty(key)) {
      if (key === "dbStatement") {
        prettySQL = formatter(transactionObject.dbStatement,{method:'sql'});
        Object.assign(dbStatement,{"string":transactionObject.dbStatement});
        tools.fetchBindVariableNames(
          transactionObject.dbStatement,
          function(err,res){
            if (err || res === undefined) {return callback(err,err);}
            if (res === null) {
              Object.assign(dbStatement,{"bindVariablesPresent":false});
              Object.assign(dbStatement,{"numberOfBindVariablesInString":0});

            }else{
              Object.assign(dbStatement,{"bindVariablesPresent":true});
              Object.assign(dbStatement,{"numberOfBindVariablesInString":res.length});
            }
            Object.assign(dbStatement,{"bindVariablesInString":res});
            Object.assign(dbStatement,{"numberOfCharsInString":transactionObject.dbStatement.length});
          }
        )
      }
    }
    if (key === "bindVariables") {
      Object.assign(dbStatement,{"bindVariableSetting":transactionObject.bindVariables});
      Object.assign(dbStatement,{"numberOfBindVariablesSet":Object.keys(transactionObject.bindVariables).length});
    }
  }
  if (!dbStatement.bindVariableSetting) {
    Object.assign(dbStatement,{"bindVariableSetting":null});
    Object.assign(dbStatement,{"numberOfBindVariablesSet":0});
  };

//dbResponse--------------------------------------------------------------------
  function SetDbResponse(){
    if(transactionObject.error){
      return 'ERROR';
    }else{
      if (dbResponse.rows.length > 0) {
        if (transactionObject.outputFormat === 'json') {
          return JSON.stringify(dbResponse.rows);
        }else{return dbResponse.rows;}
      }else{
        return transactionObject.zeroRowMessage;
      }
    }
  };
  var dbColumnsReturned;
  var dbRowsReturned;
  var dbCharsReturned;
  if(transactionObject.error){
    dbColumnsReturned = 0;
    dbRowsReturned = 0;
    dbCharsReturned = 0;
  }else{
    dbColumnsReturned = dbResponse.metaData.length;
    dbRowsReturned = dbResponse.rows.length;
    dbCharsReturned = (JSON.stringify(dbResponse.rows).length)-2;
  }

//metaData----------------------------------------------------------------------
  var metaData = {};
  Object.assign(metaData,{"columns":dbColumnsReturned});
  Object.assign(metaData,{"rows":dbRowsReturned});
  Object.assign(metaData,{"characters":dbCharsReturned});
  var columnHeaders = [];
  if(!transactionObject.error){
    for (var i = 0; i<dbResponse.metaData.length; i++){
      if (dbResponse.metaData[i].name) {columnHeaders.push(dbResponse.metaData[i].name);}
    }
  }
  Object.assign(metaData,{"columnHeaders":columnHeaders});
  if(transactionObject.error){Object.assign(metaData,{"characters":0})}else{Object.assign(metaData,{"characters":(JSON.stringify(dbResponse.rows).length)-2})};
  for (var key in transactionObject) {
    if (transactionObject.hasOwnProperty(key)) {
      if (key === "maxRowsReturned") {Object.assign(metaData,{"rowLimit":transactionObject[key]});}
      if (key === "outputFormat") {Object.assign(metaData,{"outputFormat":transactionObject[key]});}
      if (key === "zeroRowMessage") {Object.assign(metaData,{"zeroRowMessage":transactionObject[key]});}
    }
  }
  Object.assign(metaData,{"created":endTime});
  Object.assign(metaData,{"timestamp":endTimestamp});

//metrics-----------------------------------------------------------------------
  var startTimeID = transactionObject.startTimeObject.utcTime.utcID;
  var endTimeID = transactionObject.endTimeObject.utcTime.utcID;
  var avgCharsPerRow = function (){if(dbRowsReturned > 1){return Math.round((dbCharsReturned/dbRowsReturned)*100)/100;}else{return 0;}};
    var metrics = {
      "secondsTaken" : (endTimeID - startTimeID)/1000,
      "avgCharsPerRow" : avgCharsPerRow(),
      "rowsPerSecond" : Math.round((dbRowsReturned/((endTimeID - startTimeID)/1000))*100)/100,
      "charsPerSecond" : Math.round((dbCharsReturned/((endTimeID - startTimeID)/1000))*100)/100
    };

//error------------------------------------------------------------------------
  var error = {};
  if(transactionObject.error) {
    error = {
    "errorType"    : transactionObject.error.errType,
    "message" : transactionObject.error.errMsg,
    "errorTime"    : endTimestamp
    };
  }else{
     error = {"message" : 'No Error'};
  }

//Gopher Response----------------------------------------------------------------------
  var gopherResponse = {};
  var gopherVerboseResponse = {
    "host":host,
    "network":network,
    "connection":connection,
    "dbStatement":dbStatement,
    "dbResponse":SetDbResponse(),
    "metaData":metaData,
    "metrics":metrics,
    "error":error
  };
  var gopherDataOnlyResponse = SetDbResponse();
  for (var i in transactionObject.responseOutput) {
    if (transactionObject.responseOutput[i] === "verbose"){
      gopherResponse = gopherVerboseResponse;
    }else if (transactionObject.responseOutput[i] === "dataOnly"){
      gopherResponse = gopherDataOnlyResponse;
    }else if (transactionObject.responseOutput[i] === "sqlOnly" || transactionObject.responseOutput[i] === "beautifySql"){
      gopherResponse = prettySQL;
    }else{
      if (transactionObject.responseOutput[i] === "host"){Object.assign(gopherResponse,{"host":host});}
      if (transactionObject.responseOutput[i] === "network"){Object.assign(gopherResponse,{"network":network});}
      if (transactionObject.responseOutput[i] === "connection"){Object.assign(gopherResponse,{"connection":connection});}
      if (transactionObject.responseOutput[i] === "error"){Object.assign(gopherResponse,{"error":error});}
      if (transactionObject.responseOutput[i] === "dbStatement"){Object.assign(gopherResponse,{"dbStatement":dbStatement});}
      if (transactionObject.responseOutput[i] === "dbResponse"){Object.assign(gopherResponse,{"dbResponse":SetDbResponse()});}
      if (transactionObject.responseOutput[i] === "metaData"){Object.assign(gopherResponse,{"metaData":metaData});}
      if (transactionObject.responseOutput[i] === "metrics"){Object.assign(gopherResponse,{"metrics":metrics});}
    }
  }

return callback(undefined,gopherResponse);
}

module.exports = gopherResponse;
