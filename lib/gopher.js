/*****************************************************************
  NAME: gopher.js
  PATH: /lib/gopher.js
  WHAT: Facilitates data transactions between this module and
        the oracledb Database driver "oracledb". Applies
        application defaults when necessary, utilizes other gopher
        function libraries and returns a dataset based on set
        inputs.
******************************************************************/
"use strict";

/******************************************************************
                       THE NEW WAY.... (v0.1.4 release)
******************************************************************/
const GopherConnect = require('./gopher-connect')//.GopherConnect
const gopherDefaults = require('../defaults').defaults

class Gopher extends GopherConnect {

  constructor (connectionInputs) {
    super()
    this.connectionInputs = connectionInputs
  }
  run (transactionInputs) {
    return new Promise ((resolve, reject) => {
      super.gopherChatter(
        'start/end',
        'Start gopher operation')
      super.fetchInputs(this.connectionInputs.connection, this.connectionInputs.connectionLibraries) //scan through all connection libraries refrenced ... get connection config
      .then((connectionConfig) => {
        super.fetchInputs(transactionInputs.transaction,connectionConfig.transactionLibraries) //scan through all transactions libraries referenced... get transaction config
        .then((transactionConfig) => {
          new GopherConnect(
            connectionConfig,
            super.setTransactionConfiguration(transactionInputs,gopherDefaults,transactionConfig))
          .sendTransaction()
          .then((response) => {
            resolve(
            response ) })
          .catch((gophErr) => {
            super.gopherChatter(
              'gophErr',
              gophErr )
            reject(
              gophErr ) })
        })
        .catch((gophErr) => {
          super.gopherChatter(
            'gophErr',
            gophErr )
          reject(
            gophErr ) }) })
      .catch((gophErr) => {
        super.gopherChatter(
          'gophErr',
          gophErr )
        reject(
          gophErr) }) })

  }

  runStatement (transactionInputs) {

  //   return new Promise ((resolve, reject) => {
  //     let connObj = this.connectionInputs
  //     let fetchConnectionInputs = this.fetchConnectionInputs;
  //     let transactionConfig={};
  //
  //     super.sqlQueryBuilder(transactionInputs.dbStatement,transactionInputs.swapValues)
  //     .then((res) => {
  //       Object.assign(transactionConfig,
  //         {"dbStatement": res}  )
  //       super.fetchConnectionInputs(connObj)
  //       .then((connectionConfig) => {
  //         super.setProperties(transactionInputs,transactionConfig,this.defaults)
  //         this.transactionConfig = transactionConfig
  //         super.gopherTunnel(connectionConfig,transactionConfig)
  //         .then((res) => {
  //           resolve(res) })
  //         .catch((gophErr) => {
  //           console.log(GOPHER_ERROR_PROMPT+gophErr+'\n')
  //           reject(gophErr) }) })
  //       .catch((gophErr) => {
  //         console.log(GOPHER_ERROR_PROMPT+gophErr+'\n');
  //         reject(gophErr) }) })
  //     .catch((gophErr) => {
  //       console.log(GOPHER_ERROR_PROMPT+gophErr+'\n')
  //       reject(gophErr) }) })
  //
   }

}


// /******************************************************************
//                        THE OLD WAY
//                        to be decommissioned...
// ******************************************************************/
/*****************************************************************
  NAME: gopher.js
  PATH: /lib/gopher.js
  WHAT: Facilitates data transactions between this module and
        the oracledb Database driver "oracledb". Applies
        application defaults when necessary, utilizes other gopher
        function libraries and returns a dataset based on set
        inputs.
******************************************************************/
// "use strict";
// const connection = require('./gopher-connect.js');
// const tools = require('./gopher-tools.js');
//
// /******************************************************************
// Module Constants/Defaults
// *******************************************************************/
// //WARNING!: Environment Subject to Change. Based on the location and
// //          intended usage of this module, changes to the
// //          defaults will change upon module updates (using npm)
//
// //-----------TIME ZONE DEFAULT-----------
// const TIME_ZONE_DEFAULT = 'utc'; //choose either 'local' or 'utc'
// //-----------NO ROWS RETURNED MESSAGE DEFAUT-----------
// //the default message returned if no rows are returned via the transaction plan
// const ZERO_ROW_MESSAGE_DEFAULT = "0 rows returned";
//
// //-----------NUMBER OF ROWS RETURNED DEFAULT-----------
// //the default for the number of rows returned from database output. can be
// //overidden by including/setting the "maxRowsReturned" property within the
// //transaction plan
// const MAX_ROWS_RETURNED_DEFAULT = 2000;
//
// //-----------RETURNED DATA FORMAT----------------------
// const OUTPUT_FORMAT_DEFAULT = "json";
// //the default format used for the database output. choose "json", "array",
// //or "object". can be overidden by including/setting the "outputFormat"
// //properties within the transaction plan
//
// //-----------AMOUNT OF RESPONSE DEFAULT-----------------
// //the default level of verbosity from your gopher...add what is needed to the array.
// // the choices: 'dbResponse', 'metaData', 'dbStatement', 'metics', 'host', 'network', 'connection',
// //              'dataOnly','sqlOnly','verbose'
// const RESPONSE_OUTPUT_DEFAULT =['dataOnly'];
//
// //-----------CONFIGURE CONSOLE PROMPT------------------
// const PROMPT_TEXT = '<GOPHER}~';
// const PROMPT_COLOR = 3;  //CODES: 0=Black, 1=Red, 2=Green, 3=Yellow, 4=Blue, 5=Magenta, 6=Cyan, 7=White
//
// //-----------CONFIGURE ERROR PROMPT--------------------
// const ERROR_PROMPT_TEXT = 'ERROR:';
// const ERROR_PROMPT_COLOR = 1; //CODES: 0=Black, 1=Red, 2=Green, 3=Yellow, 4=Blue, 5=Magenta, 6=Cyan, 7=White
//
//
//
// var GOPHER_PROMPT = '\x1b[3'+PROMPT_COLOR+'m'+'\n'+PROMPT_TEXT+' \x1b[0m';
// var GOPHER_ERROR_PROMPT = GOPHER_PROMPT+'\x1b[3'+ERROR_PROMPT_COLOR+'m'+ERROR_PROMPT_TEXT+' \x1b[0m';
//
// /******************************************************************
// Gopher Constructor
// *******************************************************************/
// function Gopher(connObj) {
//
//   this.connObj = connObj;
//   this.fetchConnectionInputs = tools.fetchConnectionInputs;
//   this.setProperties = tools.setProperties;
//   this.defaultObj = {
//     "maxRowsReturned" : MAX_ROWS_RETURNED_DEFAULT,
//     "outputFormat"    : OUTPUT_FORMAT_DEFAULT,
//     "zeroRowMessage"  : ZERO_ROW_MESSAGE_DEFAULT,
//     "responseOutput"  : RESPONSE_OUTPUT_DEFAULT,
//     "timeZone"        : TIME_ZONE_DEFAULT
//   };
//
// }
//
// /******************************************************************
// Gopher Prototypes
// *******************************************************************/
//
// //-----------RUN PROTOTYPE------------------
// Gopher.prototype.run = function (transactionPlan,callback){
//       let setProperties = this.setProperties;
//       let defaultObj = this.defaultObj;
//       let connObj = this.connObj
//       let fetchConnectionInputs = this.fetchConnectionInputs;
//       let transactionObject={};
//       let transactionName = transactionPlan.transaction ? transactionPlan.transaction : undefined;
//       let swapValues = transactionPlan.swapValues ? transactionPlan.swapValues : undefined;
//   fetchConnectionInputs(connObj)
//     .then((connectionObject)=>{
//       //fetch transaction plan from library
//       tools.fetchInputs(transactionName,connectionObject.transactionLibraries)
//        .then((transactionObject)=>{
//          //if swapValues present in fetched transaction Plan, update the swapValues variable
//          if (transactionObject.swapValues){
//            swapValues = transactionObject.swapValues
//          }
//          //build SQL String
//          tools.sqlQueryBuilder(transactionObject.dbStatement,swapValues,function(err,res){
//            if(err){console.log(GOPHER_ERROR_PROMPT+err+'\n');
//                    return callback(err,err);}
//            //set assembled SQL string within the dbStatment property
//            Object.assign(transactionObject,{"dbStatement": res});
//              //apply defaults/overrides
//              setProperties(transactionPlan,transactionObject,defaultObj);
//              //Open connection, send Db Statement, recieve info, close connection
//              connection.runTransaction(
//                connectionObject,
//                transactionObject,
//                function(err,res){
//                    //when error using oracle driver, handle...
//                  if(err){
//                    //display error on console
//                    console.log(GOPHER_ERROR_PROMPT+err+'\n');
//                    return callback(err,res);
//                  }
//                    callback(err,res);
//                }
//              )
//          })
//        })
//        .catch((err)=>{
//          //if there is no transacton plan and a dbStatement has been configured
//          if(err ==='Inputs for both \"Name\" and \"Libraries\" must not be undefined' && transactionPlan.dbStatement){
//            //if swapValues exist, set within the transactionObject
//            if (swapValues) Object.assign(transactionObject,{"swapValues": swapValues});
//            //assemble SQL string pieces
//            tools.sqlQueryBuilder(transactionPlan.dbStatement,swapValues,function(err,res){
//              if(err){console.log(GOPHER_ERROR_PROMPT+err+'\n');
//                      return callback(err,err);}
//              //set assembled SQL string within the dbStatment property
//              Object.assign(transactionObject,{"dbStatement": res});
//                //apply defaults/overrides
//                setProperties(transactionPlan,transactionObject,defaultObj);
//                //Open connection, send Db Statement, recieve info, close connection
//                connection.runTransaction(
//                  connectionObject,
//                  transactionObject,
//                  function(err,res){
//                      //when error using oracle driver, handle...
//                    if(err){
//                      //display error on console
//                      console.log(GOPHER_ERROR_PROMPT+err+'\n');
//                      return callback(err,res);
//                    }
//                      callback(err,res);
//                  }
//                )
//            })
//          }else{
//            console.log(GOPHER_ERROR_PROMPT+err+'\n');
//            reject(err,'ERROR');
//          }
//        })
//
//     })
//     //when error in fetching connection inputs, handle...
//     .catch((err,res)=>{
//       //display error on console
//       console.log(GOPHER_ERROR_PROMPT+err+'\n');
//       reject(err,'ERROR');
//     })
// }
//
//
// //-----------STATEMENT PROTOTYPE------------------
// Gopher.prototype.runStatement = function (transactionPlan,callback){
//
//       let setProperties = this.setProperties;
//       let defaultObj = this.defaultObj;
//       let connObj = this.connObj
//       let fetchConnectionInputs = this.fetchConnectionInputs;
//       let transactionObject={};
//
//       tools.sqlQueryBuilder(transactionPlan.dbStatement,transactionPlan.swapValues,function(err,res){
//         if(err){console.log(GOPHER_ERROR_PROMPT+err+'\n');
//                 return callback(err,err);}
//         Object.assign(transactionObject,{"dbStatement": res});
//         //upon retrieval of inputs....
//         fetchConnectionInputs(connObj)
//           //when successfull...
//           .then(
//             //using the output from fetchConnectionInputs...
//             function(connectionObject){
//               //apply defaults/overrides
//               setProperties(transactionPlan,transactionObject,defaultObj);
//               //Open connection, send Db Statement, recieve info, close connection
//               connection.runTransaction(
//                 connectionObject,
//                 transactionObject,
//                 function(err,res){
//                     //when error using oracle driver, handle...
//                   if(err){
//                     //display error on console
//                     console.log(GOPHER_ERROR_PROMPT+err+'\n');
//                     return callback(err,res);
//                   }
//                     callback(err,res);
//                 }
//               )
//             }
//           )
//           //when error in fetching connection inputs, handle...
//           .catch(function(err,res){
//             //display error on console
//             console.log(GOPHER_ERROR_PROMPT+err+'\n');
//             reject(err,'ERROR');
//           })
//       })
// }
module.exports = Gopher;











module.exports = Gopher;
