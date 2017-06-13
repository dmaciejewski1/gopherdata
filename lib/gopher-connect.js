/*****************************************************************
  NAME: gopher-connect.js
  PATH: /lib/gopher-connect.js
  WHAT: Functions that facilitate data transactions between this
        module and the Node Oracle Database driver "oracledb".
******************************************************************/
"use strict";

/******************************************************************
                       THE NEW WAY.... (v0.2.0 release)
******************************************************************/
const GopherResponse = require('./gopher-response')//.GopherResponse
const oracledb = require('oracledb')

class GopherConnect extends GopherResponse
{
  constructor(connectionConfig, transactionConfig) {
    super()
    this.connectionConfig = connectionConfig
    this.transactionConfig = transactionConfig
    this.dbResponseConfig = {}
    this.asJSON = 0
    this.bindVariableNames
    this.bindVariablesPresent
    this.gopherTunnel
    this.openTunnels = []
    this.gopherResponse =  (response) => {
      return new Promise ((resolve, reject)=>{
        new GopherResponse(this.connectionConfig, this.transactionConfig, response)
        .generateReport()
        .then((gophRes) => {
          super.gopherChatter(
            'activity',
            'Gopher response handled')
          resolve(
            gophRes ) })
        .catch((gophErr) => {
          super.gopherChatter(
            'gophErr',
            gophErr )
          reject(
            gophErr ) }) })
    }
  }

  _gophTimeOut(time, msg) {
    return new Promise ((resolve)=>{
      super.gopherChatter('activity','Timer started. Transaction Time Out set at '+this.transactionConfig.timeOut/1000+' seconds')
      setTimeout(
        () => {
          resolve(
            msg )},
        time ) })
  }

  _gophErrOutput(errType, errMsg) {
    return new Promise ((resolve, reject) => {
      Object.assign(//set connnection end time
        this.transactionConfig,
        { "endTimeObject" : super.getDateObject() } )
      Object.assign(//set properties for error response and append to this.transactionConfig
        this.transactionConfig,
        { "error" :
          { "errType" : errType,
            "errMsg" : errType == 'oracle' ? errMsg.toString() : errMsg } })
      this.gopherResponse('ERROR') //pass to gopherResponse to handle output
      .then((gophRes)=>{
        resolve(
          gophRes )  })
      .catch((gophErr)=>{
        super.gopherChatter(
          'gophErr',
          gophErr )
        reject(
          gophErr ) }) })
  }

  _gophResOutput(dbResponse) {
    return new Promise ((resolve, reject) => {
      Object.assign(
        this.transactionConfig,
        { "endTimeObject" : super.getDateObject() });
      this.gopherResponse(dbResponse)
      .then((gophRes)=>{
        super.gopherChatter('response',gophRes)
        resolve(
          gophRes ) })
      .catch((gophErr)=>{
        super.gopherChatter(
          'gophErr',
          gophErr )
        reject(
          gophErr ) }) })
  }

  _gophHandleResponse(dbResponse, gophErr, gophErrType) {
    return new Promise ((resolve, reject) => {
      if (gophErr) {
        this._gophErrOutput(gophErrType,gophErr)
        .then((response)=>{
          reject(
            response ) })
        .catch((gophErr)=>{
          super.gopherChatter(
            'gophErr',
            gophErr )
          reject(
            gophErr ) }) }
      else {
        this._gophResOutput(dbResponse)
        .then((response) => {
          resolve(
            response ) })
        .catch((gophErr) => {
          super.gopherChatter(
            'gophErr',
            gophErr )
          reject(
            gophErr ) }) } })
  }

  _gophOpenTunnel() {
    return new Promise ((resolve, reject) => {
      super.setConnectionString(this.connectionConfig)
      oracledb.getConnection(this.connectionConfig)
       .then((oracleConnection) => {
         this.openTunnels.push(oracleConnection)
         super.gopherChatter(
           'database',
           'Database connection open with '+this.connectionConfig.user+'@'+this.connectionConfig.host)
         resolve(
           this.openTunnels.length-1 ) })
       .catch((oraErr) => {
         super.gopherChatter(
           'gophErr',
           oraErr )
         reject(oraErr) })
         })

  }

  _gophCloseTunnel(connID) {//<---NOTE: the current methodology may produce errors when attempting to close a connection that doesn't exsist
    return new Promise ((resolve,reject) => {
      this.openTunnels[connID].release(
        (oraErr) => {
          if (oraErr) {
            super.gopherChatter(
              'gophErr',
              oraErr )
            reject(
              oraErr ) }
          else {
            super.gopherChatter(
              'database',
              'Database connection closed with '+this.connectionConfig.user+'@'+this.connectionConfig.host)
            resolve(
            'Gopher tunnel '+ connID +' has been closed' ) } } ) })
  }

  _gophCloseAllTunnels() {//<---NOTE: the current methodology may produce errors when attempting to close a connection that doesn't exsist
    return new Promise ((resolve,reject) => {
      for (let connID; connID < this.openTunnels.length; connID++) {
        this.openTunnels[connID].release(
          (oraErr) => {
            if (oraErr) {
              super.gopherChatter(
                'gophErr',
                oraErr )
              reject(
                oraErr ) }
            else {
              super.gopherChatter(
                'database',
                'All database connections have been closed')
              resolve(
                'Gopher tunnel '+ connID +' has been closed' ) } }) } })
  }

  _gophSendSQLGetResponse(connID) {
    return new Promise ((resolve, reject) => {
      this.openTunnels[connID].execute(
        this.transactionConfig.dbStatement,
        this.transactionConfig.bindVariables,
        this.dbResponseConfig )
      .then((dbResponse) => {
        super.gopherChatter('database', 'Transaction sent to '+this.connectionConfig.user+'@'+this.connectionConfig.host)
        resolve(
          dbResponse ) })
      .catch((oraErr) => {
        super.gopherChatter(
          'gophErr',
          oraErr )
        reject(
          oraErr ) }) })
  }


  _gophHandleDbConfig() {
    super.setConnectionString(this.connectionConfig)
    .then((newConnObj) => {
      super.gopherChatter(
        'activity',
        'Connection string set for '+this.connectionConfig.user+'@'+this.connectionConfig.host)
      this.connectionObject = newConnObj })
    .catch((gophErr) => {
      gophErr })

    for (var key in this.transactionConfig) {
      if (this.transactionConfig.hasOwnProperty(key)) {
        if (key === "maxRowsReturned") {
          Object.assign(
            this.dbResponseConfig,
            { "maxRows":this.transactionConfig[key]} ) }
        if (key === "outputFormat") {
          if (this.transactionConfig[key] === 'array'){
            Object.assign(
              this.dbResponseConfig,
              { "outFormat": oracledb.ARRAY } ) }
          if (this.transactionConfig[key] === 'object'){
            Object.assign(
              this.dbResponseConfig,
              { "outFormat" : oracledb.OBJECT } ) }
          if (this.transactionConfig[key] === 'json'){
            asJSON = 1
            Object.assign(
              this.dbResponseConfig,
              { "outFormat" : oracledb.OBJECT } ) } } } }
      super.gopherChatter(
        'activity',
        'Database response configuration set')
  }

  _runGopherOnce () {
    return new Promise ((resolve, reject) => {
      this._gophHandleDbConfig()
      this._gophOpenTunnel()
      .then((tunnelID) => {
        this._gophSendSQLGetResponse(tunnelID)
        .then((dbResponse) => {
          this._gophCloseTunnel(tunnelID)
          .then(() => {
              this._gophHandleResponse(dbResponse)
              .then((response)=>{
                resolve(
                  response ) })
              .catch((gophErr)=>{
                super.gopherChatter(
                  'gophErr',
                  gophErr )
                reject(
                  gophErr ) }) })
          .catch((oraErr) => {
            super.gopherChatter(
              'gophErr',
              oraErr )
            reject(
              this._gophHandleResponse(undefined, oraErr, 'oracle') ) }) })
        .catch((oraErr) => {
          super.gopherChatter(
            'gophErr',
            oraErr )
          reject(
            this._gophHandleResponse(undefined, oraErr, 'oracle') ) }) })
       .catch((oraErr) => {
         super.gopherChatter(
           'gophErr',
           oraErr )
         reject(
           this._gophHandleResponse(undefined, oraErr, 'oracle') ) }) })
  }

 sendTransaction() {
    let runTimer = this._gophTimeOut(this.transactionConfig.timeOut, this.transactionConfig.timeOutMessage)

    Object.assign(
      this.transactionConfig,
      { "startTimeObject" : super.getDateObject() } )
    return Promise.race([this._runGopherOnce(), runTimer])
    .then((result)=>{
      if (result === this.transactionConfig.timeOutMessage){
       this._gophCloseAllTunnels()
       .then((res) => {if (res) {/*do nothing*/} })
       .catch((gophErr) => {
        // console.log(super.getTimestamp(this.transactionConfig.timeOut, this.transactionConfig.timeOutMessage));
         super.gopherChatter(
           'gophErr',
           gophErr ) })
       return this._gophHandleResponse(undefined, this.transactionConfig.timeOutMessage, 'gophErr!')
       }
      else { return result } })
 }
}



/******************************************************************
*************************** THE OLD WAY ***************************
********************* to be decommissioned... *********************
******************************************************************/
/*****************************************************************
//   NAME: gopher-connect.js
//   PATH: /lib/gopher-connect.js
//   WHAT: Functions that facilitate data transactions between this
//         module and the Node Oracle Database driver "oracledb".
// ******************************************************************/
// "use strict";
// const os = require('os');
// const oracledb = require('oracledb');
// const gopherTime = require('./gopher-time.js');
// const gopherResponse = require('./gopher-response.js');
// const gopherTools = require('./gopher-tools')
//
// /******************************************************************
// Close a Database connection
// *******************************************************************/
// function closeConnection(connection, callback){
//   connection.release(
//     function(err) {
//       if (err) {return callback(err,'Connection termination error');}
//       return callback(undefined,'Connection closed');
//     }
//   )
// }
//
// /*****************************************************************
// Open connection, send Db Statement, recieve info, close connection
// ******************************************************************/
// exports.runTransaction = function (connectionObject,transactionObject,callback) {
//
//   //set connection start time
//   Object.assign(transactionObject,{"startTimeObject": gopherTime.getDateObject()});
//
//   let transactionConfig = {};
//   let asJSON = 0;
//   let bindVariableNames;
//   let bindVariablesPresent;
//
//   //build connection string and append to connectionObject
//   gopherTools.setConnectionString(connectionObject,function(err){return callback(err,'ERROR');})
//
// //PERFORM SOME VALIDATAION OF INPUTS and SOME dbStatement PREP....
//   //if a dbStatement is present in the transactionObject...
//   if (transactionObject.dbStatement){
//      //parse the string for Bind Variables...
//      gopherTools.fetchBindVariableNames(
//        transactionObject.dbStatement,
//        function(err,res){
//          //if error...handle
//          if (err) {return callback(err,'ERROR');}
//          //set bindVariableNames array
//          bindVariableNames = res;
//          //if bindVariableNames, then bindVariablesPresent = true, else false
//          if (bindVariableNames) {
//            bindVariablesPresent = true;
//          }else{
//            bindVariableNames = [];
//            bindVariablesPresent = false;
//          }
//        }
//      )
//   }else{
//     return callback('The Transaction is missing a Statement to send to the Database','ERROR');
//   }
//
//   //if bind variables exist in the dbStatement but not are not explcitly set in the
//   //transactionObject.bindVariables property, throw error before sending to Database
//   if (bindVariablesPresent === true && Object.keys(transactionObject.bindVariables).length <1){
//     let errMsg = 'One or more of the following bind variables not set: '+ bindVariableNames;
//     //set connnection end time
//     Object.assign(transactionObject,{"endTimeObject": gopherTime.getDateObject()});
//     //set properties for error response and append to transactionObject
//     Object.assign(transactionObject,{"error":{"errType":'gophErr!',"errMsg":errMsg}});
//     //pass to gopherResponse
//     return gopherResponse(connectionObject, transactionObject, 'ERROR')
//             .then((gophRes)=>{callback(errMsg,gophRes)})
//             .catch((gophErr)=>{callback(gophErr,'ERROR')})
//   }else if (bindVariablesPresent === false && Object.keys(transactionObject.bindVariables).length >0){
//     let errMsg = 'Bind variables set, but none exist within the database statement';
//     //set connnection end time
//     Object.assign(transactionObject,{"endTimeObject": gopherTime.getDateObject()});
//     //set properties for error response and append to transactionObject
//     Object.assign(transactionObject,{"error":{"errType":'gophErr!',"errMsg":errMsg}});
//     //pass to gopherResponse
//     return gopherResponse(connectionObject, transactionObject, 'ERROR')
//             .then((gophRes)=>{callback(errMsg,gophRes)})
//             .catch((gophErr)=>{callback(gophErr,'ERROR')})
//   }
//
//
//   //if bind vars in bindVariableNames (retrieved from the dbStatement above) do not match the
//   //keys in transactionObject.bindVariables, and are not in the same order as bindVariableNames,
//   //throw error before sending to Database
//   if (Object.keys(transactionObject.bindVariables).length === bindVariableNames.length){
//     for(var i = 0; i<bindVariableNames.length; i++) {
//       var bVN = bindVariableNames[i];
//       var bVO = Object.getOwnPropertyNames(transactionObject.bindVariables)[i];
//       if (bVN !== bVO){
//         var errMsg = 'Bind variable names set do not match the names in the database statement';
//         //set connnection end time
//         Object.assign(transactionObject,{"endTimeObject": gopherTime.getDateObject()});
//         //set properties for error response and append to transactionObject
//         Object.assign(transactionObject,{"error":{"errType":'gophErr!',"errMsg":errMsg}});
//         //pass to gopherResponse
//         return gopherResponse(connectionObject, transactionObject, 'ERROR')
//                 .then((gophRes)=>{callback(errMsg,gophRes)})
//                 .catch((gophErr)=>{callback(gophErr,'ERROR')})
//       }
//     }
//   }else{
//     var errMsg = 'The number of bind variables set does not match the number of bind variables in the database statement';
//     //set connnection end time
//     Object.assign(transactionObject,{"endTimeObject": gopherTime.getDateObject()});
//     //set properties for error response and append to transactionObject
//     Object.assign(transactionObject,{"error":{"errType":'gophErr!',"errMsg":errMsg}});
//     //pass to gopherResponse
//     return gopherResponse(connectionObject, transactionObject, 'ERROR')
//             .then((gophRes)=>{callback(errMsg,gophRes)})
//             .catch((gophErr)=>{callback(gophErr,'ERROR')})
//   }
//
//
//  //set transactionObject properties (to be sent to the oracle driver)
//  for (var key in transactionObject) {
//    if (transactionObject.hasOwnProperty(key)) {
//      if (key === "maxRowsReturned") {Object.assign(transactionConfig,{"maxRows":transactionObject[key]});}// maxRowsReturned = transactionObject[key];}
//      if (key === "outputFormat") {
//        if (transactionObject[key] === 'array'){Object.assign(transactionConfig,{"outFormat": oracledb.ARRAY});}
//        if (transactionObject[key] === 'object'){Object.assign(transactionConfig,{"outFormat":oracledb.OBJECT});}
//        if (transactionObject[key] === 'json'){asJSON = 1; Object.assign(transactionConfig,{"outFormat":oracledb.OBJECT});}
//      }
//    }
//  }
//
//  //---------INITIATE DB TRANSACTION-----------
//   oracledb.getConnection(
//     connectionObject,
//     function(err, oraConnect) {
//       //Handle "getConnection" Errors
//       if (err) {callback(err,'ERROR');}
//       oraConnect.execute(
//         transactionObject.dbStatement,
//         transactionObject.bindVariables,
//         transactionConfig,
//         function (oraErr, dbResponse) {
//
//           //if oracle errors...
//           if (oraErr) {
//               //set connnection end time
//               Object.assign(transactionObject,{"endTimeObject": gopherTime.getDateObject()});
//               //set properties for error response and append to transactionObject
//               Object.assign(transactionObject,{"error":{"errType":'oracle',"errMsg": oraErr.toString()}});
//               //pass to gopherResponse
//               return gopherResponse(connectionObject, transactionObject, 'ERROR')
//                       .then((gophRes)=>{callback(oraErr,gophRes);})
//                       .catch((gophErr)=>{callback(gophErr,'ERROR');})
//           }
//           //Close database connection
//           closeConnection(oraConnect,function(closeConnectionErr,closeConnectionRes){
//             //Handle connection termination errors...
//             if(closeConnectionErr){
//               Object.assign(transactionObject,{"endTimeObject": gopherTime.getDateObject()});
//               Object.assign(transactionObject,{"error":{"errType":'oracle',"errMsg": closeConnectionErr}});
//               return gopherResponse(connectionObject, transactionObject, 'ERROR')
//                       .then((gophRes)=>{callback(closeConnectionErr,gophRes)})
//                       .catch((gophErr)=>{callback(gophErr,'ERROR')})
//             }
//             //set connnection end time
//             Object.assign(transactionObject,{"endTimeObject": gopherTime.getDateObject()});
//             return gopherResponse(connectionObject, transactionObject, dbResponse)
//                     .then((gophRes)=>{callback(undefined,gophRes)})
//                     .catch((gophErr)=>{callback(gophErr,'ERROR')})
//           });
//         }
//     );
//     }
//   );
// }

module.exports = //{
  GopherConnect //: GopherConnect,
  //runTransaction : runTransaction
//}
