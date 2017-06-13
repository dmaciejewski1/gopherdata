/*****************************************************************
  NAME: gopher-response.js
  PATH: /lib/gopher-response.js
******************************************************************/
"use strict";
/******************************************************************
                       THE NEW WAY.... (v0.2.0 release)
******************************************************************/
const GopherTools = require('./gopher-tools')//.GopherTools
const os = require('os')


class GopherResponse extends GopherTools
{
  constructor(connectionConfig, transactionConfig, dbResponse)  {
    super()

    this.formattor = require('formattor')
    this.connectionConfig = connectionConfig
    this.transactionConfig = transactionConfig
    this.dbResponse = dbResponse
    this.dbStatement
    this.sqlStr
    this.startTimestamp = () => {
      if (this.transactionConfig.timeZone === 'utc' || this.transactionConfig.timeZone == 'UTC'){
      return this.transactionConfig.startTimeObject.utcTime.timestamp}
      else{ return  this.transactionConfig.startTimeObject.localTime.timestamp}
    }
    this.endTimestamp = () => {
      if (this.transactionConfig.timeZone === 'utc' || this.transactionConfig.timeZone == 'UTC'){
      return this.transactionConfig.endTimeObject.utcTime.timestamp}
      else{ return  this.transactionConfig.endTimeObject.localTime.timestamp}
    }
    this.startTime = () => {
      if (this.transactionConfig.timeZone === 'utc' || this.transactionConfig.timeZone == 'UTC'){
      return this.transactionConfig.startTimeObject.utcTime.datetime}
      else{ return  this.transactionConfig.startTimeObject.localTime.datetime}
    }
    this.endTime = () => {
      if (this.transactionConfig.timeZone === 'utc' || this.transactionConfig.timeZone == 'UTC'){
      return this.transactionConfig.endTimeObject.utcTime.datetime}
      else{ return  this.transactionConfig.endTimeObject.localTime.datetime}
    }

    //host--------------------------------------------------------------------------
    this.setHostOutput = () => {
      let hostInfo = {
        "system":os.hostname(),
        "os":os.type(),
        "platform":os.platform(),
        "architecture":os.arch(),
        "osRelease":os.release() }
      super.gopherChatter(
        "debug",
        "host: " + JSON.stringify(hostInfo) )
      return hostInfo

    }

    //connection--------------------------------------------------------------------------
    this.setConnectionOutput = () => {
      let connectionOutput = {}
      for (let key in this.connectionConfig) {
        if (this.connectionConfig.hasOwnProperty(key)) {
          if (key === "user") {
            Object.assign(
              connectionOutput,
              { "user" : this.connectionConfig[key] } ) }
          if (key === "host") {
            Object.assign(
              connectionOutput,
              { "host" : this.connectionConfig[key] } ) }
          if (key === "port") {
            Object.assign(
              connectionOutput,
              { "port" : this.connectionConfig[key] } ) }
          if (key === "service") {
            Object.assign(
              connectionOutput,
              { "service" : this.connectionConfig[key] } ) }
          if (key === "SID") {
            Object.assign(
              connectionOutput,
              { "SID" : this.connectionConfig[key] } ) } } }
        Object.assign(
          connectionOutput,
          { "opened" : this.startTimestamp() } )
        Object.assign(
          connectionOutput,
          { "closed" : this.endTimestamp() } )
        super.gopherChatter(
          "debug",
          "connection: " + JSON.stringify(connectionOutput) )
        return connectionOutput
    }

    //dbStatement-------------------------------------------------------------------
    this.setDbStatementOutput = () => {
      let dbStatementOutput = {}
      for (let key in this.transactionConfig) {
        if (this.transactionConfig.hasOwnProperty(key)) {
          if (key === "dbStatement") {
            this.sqlStr = this.formattor(this.transactionConfig.dbStatement,{method : 'sql'})
            Object.assign(
              dbStatementOutput,
              { "string" : this.transactionConfig.dbStatement } );
            super.fetchBindVariableNames(this.transactionConfig.dbStatement)
            .then((res) => {
              if (res === undefined) {
                let gophErrMsg = 'no bind variable names returned'
                super.gopherChatter(
                  'gophErr',
                  gophErrMsg )
                reject(
                  gophErrMsg ) }
              if (res === null) {
                Object.assign(
                  dbStatementOutput,
                  { "bindVariablesPresent" : false,
                    "numberOfBindVariablesInString" : 0 } ) }
              else{
                Object.assign(
                  dbStatementOutput,
                  { "bindVariablesPresent" : true,
                    "numberOfBindVariablesInString" : res.length } ) }
              Object.assign(
                dbStatementOutput,
                { "bindVariablesInString" : res,
                  "numberOfCharsInString" : this.transactionConfig.dbStatement.length } ) })
            .catch((gophErr) => {
              super.gopherChatter(
                'gophErr',
                gophErr )
              reject(
                gophErr ) }) } }
        if (key === "bindVariables") {
          Object.assign(
            dbStatementOutput,
            { "bindVariableSetting" : this.transactionConfig.bindVariables,
              "numberOfBindVariablesSet" : Object.keys(this.transactionConfig.bindVariables).length } ) } }

      if (!dbStatementOutput.bindVariableSetting) {
        Object.assign(
          dbStatementOutput,
          { "bindVariableSetting" : null,
            "numberOfBindVariablesSet" : 0 } ) }
      super.gopherChatter(
        "debug",
        "dbStatement: " + JSON.stringify(dbStatementOutput) )
      return dbStatementOutput
    }

    //dbResponse--------------------------------------------------------------------
    this.setDbResponseOutput = () => {
      if(this.transactionConfig.error){
        return 'ERROR' }
      else{
        if (this.dbResponse.rows) {
          if (this.transactionConfig.outputFormat === 'json') {
            return JSON.stringify(this.dbResponse.rows) }
          else{
            super.gopherChatter(
              "debug",
              "dbResponse: " + JSON.stringify(this.dbResponse.rows) )
            return this.dbResponse.rows } }
        else{
          super.gopherChatter(
            "debug",
            "dbResponse: " + JSON.stringify(this.transactionConfig.zeroRowMessage) )
          return this.transactionConfig.zeroRowMessage } }
    }

    //metaData----------------------------------------------------------------------
    this.dbColumnsReturned = () => {
      let dbColumnsReturned
      if (!this.transactionConfig.error || this.dbResponse.rows){
        dbColumnsReturned = this.dbResponse.metaData.length
        super.gopherChatter(
          "debug",
          "dbColumnsReturned: " + dbColumnsReturned )
      return dbColumnsReturned}
      else{
        dbColumnsReturned = 0
        super.gopherChatter(
          "debug",
          "dbColumnsReturned: " + dbColumnsReturned )
        return  dbColumnsReturned }
    }
    this.dbRowsReturned = () => {
      let dbRowsReturned
      if (!this.transactionConfig.error || this.dbResponse.rows){
        dbRowsReturned = this.dbResponse.rows.length
        super.gopherChatter(
          "debug",
          "dbRowsReturned: " + dbRowsReturned )
      return dbRowsReturned }
      else{
        dbRowsReturned = 0
        super.gopherChatter(
          "debug",
          "dbRowsReturned: 0 " + dbRowsReturned )
        return  dbRowsReturned }
    }
    this.dbCharsReturned = () => {
      let dbCharsReturned
      if (!this.transactionConfig.error || this.dbResponse.rows){
        dbCharsReturned = (JSON.stringify(this.dbResponse.rows).length)-2
        super.gopherChatter(
          "debug",
          "dbCharsReturned: " + dbCharsReturned )
      return dbCharsReturned}
      else{
        dbCharsReturned = 0
        super.gopherChatter(
          "debug",
          "dbCharsReturned: " + dbCharsReturned )
        return  dbCharsReturned}
    }
    let metadata = {}
    this.setMetaDataOutput = () => {
      let columnHeaders = () => {
        let columnHeaders = []
        if(!this.transactionConfig.error && this.dbResponse.rows){
          for (let i = 0; i<this.dbResponse.metaData.length; i++){
            if (this.dbResponse.metaData[i].name) {
              columnHeaders.push(this.dbResponse.metaData[i].name) } } }
        return columnHeaders
      }
      metadata = {
        "columns" : this.dbColumnsReturned(),
        "rows" : this.dbRowsReturned(),
        "characters" : this.dbCharsReturned(),
        "columnHeaders" : columnHeaders(),
        "rowLimit" : this.transactionConfig.maxRowsReturned,
        "outputFormat" : this.transactionConfig.outputFormat,
        "zeroRowMessage" : this.transactionConfig.zeroRowMessage,
        "created" : this.endTime(),
        "timestamp" : this.endTimestamp() }
      super.gopherChatter(
        "debug",
        "metadata: " + JSON.stringify(metadata) )
      return metadata
      }

    //metrics-----------------------------------------------------------------------
    this.setMetricsOutput = () => {
      let startTimeID = transactionConfig.startTimeObject.utcTime.utcID,
          endTimeID = transactionConfig.endTimeObject.utcTime.utcID,
          avgCharsPerRow = () => {
            let dbRowsReturned
            if(this.dbRowsReturned() > 1){
              dbRowsReturned = Math.round((this.dbCharsReturned()/this.dbRowsReturned())*100)/100
              super.gopherChatter(
                "debug",
                "dbRowsReturned: " + dbRowsReturned )
              return dbRowsReturned  }
            else{
              dbRowsReturned = 0
              super.gopherChatter(
                "debug",
                "dbRowsReturned: " + dbRowsReturned )
              return dbRowsReturned} },
          metrics = {
            "secondsTaken" : (endTimeID - startTimeID)/1000,
            "avgCharsPerRow" : avgCharsPerRow(),
            "rowsPerSecond" : Math.round((this.dbRowsReturned()/((endTimeID - startTimeID)/1000))*100)/100,
            "charsPerSecond" : Math.round((this.dbCharsReturned()/((endTimeID - startTimeID)/1000))*100)/100 };
      super.gopherChatter(
        "debug",
        "metrics: " + JSON.stringify(metrics) )
      return metrics
    }

    //error------------------------------------------------------------------------
    this.setErrorOutput = () => {
      if(transactionConfig.error) {
        return {
        "errorType" : transactionConfig.error.errType,
        "message" : transactionConfig.error.errMsg,
        "errorTime" : this.endTimestamp() } }
      else{
         return false }
    }
  }

  //Gopher Response----------------------------------------------------------------------
  generateReport () {
     return new Promise ((resolve, reject) => {
      let gopherResponse = {};
      let gopherVerboseResponse = {
        "host":this.setHostOutput(),
        "connection":this.setConnectionOutput(),
        "dbStatement":this.setDbStatementOutput(),
        "dbResponse":this.setDbResponseOutput(),
        "metaData":this.setMetaDataOutput(),
        "metrics":this.setMetricsOutput(),
        "error":this.setErrorOutput() }
      let gopherDataOnlyResponse = this.setDbResponseOutput();
      for (var i in this.transactionConfig.responseOutput) {
        if (this.transactionConfig.responseOutput[i] === "verbose"){
          gopherResponse = gopherVerboseResponse }
        else if (this.transactionConfig.responseOutput[i] === "dataOnly"){
          gopherResponse = gopherDataOnlyResponse }
        else if (this.transactionConfig.responseOutput[i] === "sqlOnly" ||
                 this.transactionConfig.responseOutput[i] === "beautifySql"){
          gopherResponse = this.sqlStr }
        else{
          if (this.transactionConfig.responseOutput[i] === "host"){
            Object.assign(
              gopherResponse,
              { "host" : this.setHostOutput() } ) }
          if (this.transactionConfig.responseOutput[i] === "connection"){
            Object.assign(
              gopherResponse,
              { "connection" : this.setConnectionOutput() } ) }
          if (this.transactionConfig.responseOutput[i] === "error"){
            Object.assign(
              gopherResponse,
              { "error" : this.setErrorOutput() } ) }
          if (this.transactionConfig.responseOutput[i] === "dbStatement"){
            Object.assign(
              gopherResponse,
              { "dbStatement" : this.setDbStatementOutput() } ) }
          if (this.transactionConfig.responseOutput[i] === "dbResponse"){
            Object.assign(
              gopherResponse,
              { "dbResponse" : this .setDbResponseOutput() } ) }
          if (this.transactionConfig.responseOutput[i] === "metaData"){
            Object.assign(
              gopherResponse,
              { "metaData" : this.setMetaDataOutput() }) }
          if (this.transactionConfig.responseOutput[i] === "metrics"){
            Object.assign(
              gopherResponse,
              { "metrics" : this.setMetricsOutput() }) } } }
      resolve(gopherResponse)
     })
  }
}









/******************************************************************
*************************** THE OLD WAY ***************************
********************* to be decommissioned... *********************
******************************************************************/
/*****************************************************************
  NAME: gopher-response.js
  PATH: /lib/gopher-response.js
******************************************************************/
// "use strict";
// const os = require('os');
// const formatter = require('formattor');
// const tools = require('./gopher-tools.js');
// const gopherTime = require('./gopher-time.js');
//
//
// /******************************************************************
// Based on properties set in the "connectionObject",
// "transactionObject" and "dbResponse" inputs, gopherResponse
// assembles an appropriate data response output
// *******************************************************************/
// var gopherResponse = (
//   connectionObject,
//   transactionObject,
//   dbResponse) => {
//
// return new Promise ((resolve, reject) => {
//
// //set time signature variables for utc or local time----------------------------
//     var startTimestamp;
//     var endTimestamp
//     var startTime;
//     var endTime;
//     if (transactionObject.timeZone === 'utc' || transactionObject.timeZone === 'UTC'){
//       startTimestamp = transactionObject.startTimeObject.utcTime.timestamp;
//       endTimestamp = transactionObject.endTimeObject.utcTime.timestamp;
//       startTime = transactionObject.startTimeObject.utcTime.datetime;
//       endTime = transactionObject.startTimeObject.utcTime.datetime;
//     }else if (transactionObject.timeZone === 'local') {
//       startTimestamp = transactionObject.startTimeObject.localTime.timestamp;
//       endTimestamp = transactionObject.endTimeObject.localTime.timestamp;
//       startTime = transactionObject.startTimeObject.localTime.datetime;
//       endTime = transactionObject.startTimeObject.localTime.datetime;
//     }
//
// //host--------------------------------------------------------------------------
//   var host  = {
//     "system":os.hostname(),
//     "os":os.type(),
//     "platform":os.platform(),
//     "architecture":os.arch(),
//     "osRelease":os.release()
//   };
//
// //network-----------------------------------------------------------------------
//   var network = {};
// //creates a bug on RHEL 6... Commenting out for now
// //  for (var i = 0; i < os.networkInterfaces().lo0.length; i++ ) {
// //    var test = os.networkInterfaces().lo0[i].family;
// //    if (test==='IPv4') {
// //      network = os.networkInterfaces().lo0[i]; //lo0, en0, awdl0, utun0
// //    }
// //  }
//
// //connection--------------------------------------------------------------------
//   var connection = {};
//   for (var key in connectionObject) {
//     if (connectionObject.hasOwnProperty(key)) {
//       if (key === "user") {Object.assign(connection,{"user":connectionObject[key]});}
//       if (key === "host") {Object.assign(connection,{"host":connectionObject[key]});}
//       if (key === "port") {Object.assign(connection,{"port":connectionObject[key]});}
//       if (key === "service") {Object.assign(connection,{"service":connectionObject[key]});}
//       if (key === "SID") {Object.assign(connection,{"SID":connectionObject[key]});}
//     }
//   }
//   Object.assign(connection,{"opened":startTimestamp});
//   Object.assign(connection,{"closed":endTimestamp});
//
// //dbStatement-------------------------------------------------------------------
//   var dbStatement = {};
//   var prettySQL;
//   for (var key in transactionObject) {
//     if (transactionObject.hasOwnProperty(key)) {
//       if (key === "dbStatement") {
//         prettySQL = formatter(transactionObject.dbStatement,{method:'sql'});
//         Object.assign(dbStatement,{"string":transactionObject.dbStatement});
//         tools.fetchBindVariableNames(
//           transactionObject.dbStatement,
//           function(err,res){
//             if (err || res === undefined) {return reject(err);}
//             if (res === null) {
//               Object.assign(dbStatement,{"bindVariablesPresent":false});
//               Object.assign(dbStatement,{"numberOfBindVariablesInString":0});
//
//             }else{
//               Object.assign(dbStatement,{"bindVariablesPresent":true});
//               Object.assign(dbStatement,{"numberOfBindVariablesInString":res.length});
//             }
//             Object.assign(dbStatement,{"bindVariablesInString":res});
//             Object.assign(dbStatement,{"numberOfCharsInString":transactionObject.dbStatement.length});
//           }
//         )
//       }
//     }
//     if (key === "bindVariables") {
//       Object.assign(dbStatement,{"bindVariableSetting":transactionObject.bindVariables});
//       Object.assign(dbStatement,{"numberOfBindVariablesSet":Object.keys(transactionObject.bindVariables).length});
//     }
//   }
//   if (!dbStatement.bindVariableSetting) {
//     Object.assign(dbStatement,{"bindVariableSetting":null});
//     Object.assign(dbStatement,{"numberOfBindVariablesSet":0});
//   };
//
// //dbResponse--------------------------------------------------------------------
//   var dbColumnsReturned;
//   var dbRowsReturned;
//   var dbCharsReturned;
//   function SetDbResponse(){
//     if(transactionObject.error){
//       return 'ERROR';
//     }else{
//       if (dbResponse.rows) {
//         if (transactionObject.outputFormat === 'json') {
//           return JSON.stringify(dbResponse.rows);
//         }else{return dbResponse.rows;}
//       }else{
//         dbColumnsReturned = 0;
//         dbRowsReturned = 0;
//         dbCharsReturned = 0;
//         return transactionObject.zeroRowMessage;
//       }
//     }
//   };
//
//   if(transactionObject.error || !dbResponse.rows){
//     dbColumnsReturned = 0;
//     dbRowsReturned = 0;
//     dbCharsReturned = 0;
//   }else{
//     dbColumnsReturned = dbResponse.metaData.length;
//     dbRowsReturned = dbResponse.rows.length;
//     dbCharsReturned = (JSON.stringify(dbResponse.rows).length)-2;
//   }
//
// //metaData----------------------------------------------------------------------
//   var metaData = {};
//   Object.assign(metaData,{"columns":dbColumnsReturned});
//   Object.assign(metaData,{"rows":dbRowsReturned});
//   Object.assign(metaData,{"characters":dbCharsReturned});
//   var columnHeaders = [];
//   if(!transactionObject.error && dbResponse.rows){
//       for (var i = 0; i<dbResponse.metaData.length; i++){
//         if (dbResponse.metaData[i].name) {columnHeaders.push(dbResponse.metaData[i].name);}
//       }
//   }
//   Object.assign(metaData,{"columnHeaders":columnHeaders});
//   if(transactionObject.error || !dbResponse.rows){
//     Object.assign(metaData,{"characters":0}) }
//   else{
//     Object.assign(metaData,{"characters":(JSON.stringify(dbResponse.rows).length)-2}) };
//   for (var key in transactionObject) {
//     if (transactionObject.hasOwnProperty(key)) {
//       if (key === "maxRowsReturned") {Object.assign(metaData,{"rowLimit":transactionObject[key]});}
//       if (key === "outputFormat") {Object.assign(metaData,{"outputFormat":transactionObject[key]});}
//       if (key === "zeroRowMessage") {Object.assign(metaData,{"zeroRowMessage":transactionObject[key]});}
//     }
//   }
//   Object.assign(metaData,{"created":endTime});
//   Object.assign(metaData,{"timestamp":endTimestamp});
//
// //metrics-----------------------------------------------------------------------
//   var startTimeID = transactionObject.startTimeObject.utcTime.utcID;
//   var endTimeID = transactionObject.endTimeObject.utcTime.utcID;
//   var avgCharsPerRow = function (){if(dbRowsReturned > 1){return Math.round((dbCharsReturned/dbRowsReturned)*100)/100;}else{return 0;}};
//     var metrics = {
//       "secondsTaken" : (endTimeID - startTimeID)/1000,
//       "avgCharsPerRow" : avgCharsPerRow(),
//       "rowsPerSecond" : Math.round((dbRowsReturned/((endTimeID - startTimeID)/1000))*100)/100,
//       "charsPerSecond" : Math.round((dbCharsReturned/((endTimeID - startTimeID)/1000))*100)/100
//     };
//
// //error------------------------------------------------------------------------
//   var error = {};
//   if(transactionObject.error) {
//     error = {
//     "errorType"    : transactionObject.error.errType,
//     "message" : transactionObject.error.errMsg,
//     "errorTime"    : endTimestamp
//     };
//   }else{
//      error = false;
//   }
//
// //Gopher Response----------------------------------------------------------------------
//   var gopherResponse = {};
//   var gopherVerboseResponse = {
//     "host":host,
//     //"network":network,
//     "connection":connection,
//     "dbStatement":dbStatement,
//     "dbResponse":SetDbResponse(),
//     "metaData":metaData,
//     "metrics":metrics,
//     "error":error
//   };
//   var gopherDataOnlyResponse = SetDbResponse();
//   for (var i in transactionObject.responseOutput) {
//     if (transactionObject.responseOutput[i] === "verbose"){
//       gopherResponse = gopherVerboseResponse;
//     }else if (transactionObject.responseOutput[i] === "dataOnly"){
//       gopherResponse = gopherDataOnlyResponse;
//     }else if (transactionObject.responseOutput[i] === "sqlOnly" || transactionObject.responseOutput[i] === "beautifySql"){
//       gopherResponse = prettySQL;
//     }else{
//       if (transactionObject.responseOutput[i] === "host"){Object.assign(gopherResponse,{"host":host});}
//       //if (transactionObject.responseOutput[i] === "network"){Object.assign(gopherResponse,{"network":network});}
//       if (transactionObject.responseOutput[i] === "connection"){Object.assign(gopherResponse,{"connection":connection});}
//       if (transactionObject.responseOutput[i] === "error"){Object.assign(gopherResponse,{"error":error});}
//       if (transactionObject.responseOutput[i] === "dbStatement"){Object.assign(gopherResponse,{"dbStatement":dbStatement});}
//       if (transactionObject.responseOutput[i] === "dbResponse"){Object.assign(gopherResponse,{"dbResponse":SetDbResponse()});}
//       if (transactionObject.responseOutput[i] === "metaData"){Object.assign(gopherResponse,{"metaData":metaData});}
//       if (transactionObject.responseOutput[i] === "metrics"){Object.assign(gopherResponse,{"metrics":metrics});}
//     }
//   }
//
//       return resolve(gopherResponse);
//
//   })
// }

module.exports = //{
  GopherResponse //: GopherResponse,
  //gopherResponse : gopherResponse
//}
