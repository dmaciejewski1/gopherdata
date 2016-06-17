/*****************************************************************
  NAME: gopher-tools.js
  PATH: /lib/gopher-tools.js
******************************************************************/
"use strict";
const fs = require('fs');
const os = require('os');
const tools = require('./gopher-tools.js');

/******************************************************************
Returns false if input sqlStatement does not begin with the word
"select" (not case sensitve)
*******************************************************************/
exports.stringStartsWithSelect = function(sqlStatement){
  var regexExpression = /^select/ig;
  var beginsWithSelect = sqlStatement.match(regexExpression);
  if (beginsWithSelect){return true;}
  return false;
}

/******************************************************************
Returns an array of unallowed phrases (i.e. those phrase patterns
that pertain to certain System, Data Dictionary, Anonymous Block,
Insert, Update, Delete or DDL database function) detected in the
input sqlStatement
*******************************************************************

    ------------------------------
    | Restricted Phrase Patterns |
    ------------------------------
    -----------REMOVAL------------
      ...truncate table...
      ...drop table...
      ...drop procedure...
      ...drop package...
      ...drop function...
      ...drop index...
      ...drop bitmap index...
      ...drop unique index...
      ...drop materialized view...
      ...drop view...
      ...drop trigger...
      ...drop type...
      ...delete from...
      ...purge table...
      ...purge recyclebin...
    -------------DDL--------------
      ...create or replace...
      ...create table
      ...alter table...
      ...create procedure...
      ...create package...
      ...create function...
      ...create index...
      ...alter index...rebuild...
      ...alter index...rename...
      ...create bitmap index...
      ...create unique index...
      ...create materialized view...
      ...create view...
      ...alter view...
      ...create trigger...
      ...create type...as...
    -----------SYSTEM-------------
      ...alter system set...
      ...shutdown normal...
      ...shutdown immediate...
      ...shutdown transactional...
      ...shutdown abort...
    -------------DML--------------
      ...update...set...
      ...insert into...
      ...insert all into...
      ...merge into...using...
      ...from...@...
    -------ANONYMOUS BLOCK--------
      ...begin...;...end...
      ...sys. ...
      ...execute immediate...
      ...&&...
    -------DATA DICTIONARY--------
      ...v$...
      ...from...all_...
      ...from...dba_...
      ...from...user_...
*/
exports.rejectInject = function(sqlStatement){
  var regexExpression =
     new RegExp(
      //---REMOVAL---
      '\\btruncate+[\\s]+\\btable|'+
      '\\bdrop+[\\s]+\\btable|'+
      '\\bdrop+[\\s]+\\bprocedure|'+
      '\\bdrop+[\\s]+\\bpackage|'+
      '\\bdrop+[\\s]+\\bfunction|'+
      '\\bdrop+[\\s]+\\bindex|'+
      '\\bdrop+[\\s]+\\bbitmap+[\\s]+\\bindex|'+
      '\\bdrop+[\\s]+\\bunique+[\\s]+\\bindex|'+
      '\\bdrop+[\\s]+\\bmaterialized+[\\s]+\\bview|'+
      '\\bdrop+[\\s]+\\bview|'+
      '\\bdrop+[\\s]+\\btrigger|'+
      '\\bdrop+[\\s]+\\btype|'+
      '\\bpurge+[\\s]+\\btable|'+
      '\\bpurge+[\\s]+\\brecyclebin|'+
      '\\bdelete+[\\s]+\\bfrom|'+
      //---DDL---
      '\\bcreate+[\\s]+\\bor+[\\s]+\\breplace|'+
      '\\bcreate+[\\s]+\\btable|'+
      '\\balter+[\\s]+\\btable|'+
      '\\bcreate+[\\s]+\\bprocedure|'+
      '\\bcreate+[\\s]+\\bpackage|'+
      '\\bcreate+[\\s]+\\bfunction|'+
      '\\bcreate+[\\s]+\\bindex|'+
      '\\balter+[\\s]+\\bindex+[\\w\\W]+\\brebuild|'+
      '\\balter+[\\s]+\\bindex+[\\w\\W]+\\brename|'+
      '\\bcreate+[\\s]+\\bbitmap+[\\s]+\\bindex|'+
      '\\bcreate+[\\s]+\\bunique+[\\s]+\\bindex|'+
      '\\bcreate+[\\s]+\\bmaterialized+[\\s]+\\bview|'+
      '\\bcreate+[\\s]+\\bview|'+
      '\\balter+[\\s]+\\bview|'+
      '\\bcreate+[\\s]+\\btrigger|'+
      '\\balter+[\\s]+\\btrigger|'+
      '\\bcreate+[\\s]+\\btype+[\\w\\W]+as|'+
      //---SYSTEM---
      '\\balter+[\\s]+\\bsystem+[\\s]+\\bset|'+
      '\\bshutdown+[\\s]+\\bnormal|'+
      '\\bshutdown+[\\s]+\\bimmediate|'+
      '\\bshutdown+[\\s]+\\btransactional|'+
      '\\bshutdown+[\\s]+\\babort|'+
      //---DML---
      '\\bupdate+[\\w\\W]+\\bset|'+
      '\\binsert+[\\s]+\\binto|'+
      '\\binsert+[\\s]+\\ball+[\\s]+\\binto|'+
      '\\bmerge+[\\s]+\\binto[\\w\\W]+using|'+
      '\\bfrom+[\\w\\W]+\\b\\@|'+
      //---ANONYMOUS BLOCK---
      '\\bbegin+[\\w\\W]+\\;+[\\w\\W]+end|'+
      '\\bsys\\.|'+
      '\\bexecute+[\\s]+\\bimmediate|'+
      '\\&\\&\\b|'+
      //---DATA DICTIONARY---
      '\\bv\\$|'+
      '\\bfrom+[\\w\\W]+\\ball_|'+
      '\\bfrom+[\\w\\W]+\\bdba_|'+
      '\\bfrom+[\\w\\W]+\\buser_'
    ,'ig');
  var restrictedPhrases = sqlStatement.match(regexExpression);
  if (restrictedPhrases){return restrictedPhrases;}
  return false;
}

/******************************************************************
Since "bind variables" only work after the SQL "WHERE" clause, the
sqlQueryBuilder function works anywhere within the SQL string...
This can be especally helpful when needing to make changes within
the SELECT and FROM clauses
*******************************************************************/
exports.sqlQueryBuilder = function(sqlStatement,swapValues,callback) {
  var regexExpression = /\B<[\w]+\b\}~\B/g; //find all words (or any variation of contiguous letters and numbers) that are bound between a "LESS THAN" and a "CLOSE CURLY BRACE TILDE" e.g. <Some Variable Here}~
  var bindVariableExtract = sqlStatement.match(regexExpression); //every bind variable in the sqlStatement
  var bindVariableArray = [];
  var sqlstr = sqlStatement;

  if (!bindVariableExtract){return callback (undefined,sqlStatement);}
  //select one of each bind variable types and place in the bindVariableArray (ordered by how they first appear in the statement)
  for (var i = 0; i < bindVariableExtract.length; i++) {
    var isDistinct = bindVariableArray.indexOf(bindVariableExtract[i])
    if (isDistinct === -1) {
      bindVariableArray.push(bindVariableExtract[i]);
    }
  }

  //some simple error checking...
  var noOfBindVariables = bindVariableArray.length;
  var noOfValues = swapValues.length;
  if (noOfBindVariables !== noOfValues) {return callback('SQL Statement Rejected: The number of \"Swap Values\" entered does not match the number of \"Swap Variables\" types found in the SQL Statement','error');}
  //if (noOfBindVariables === noOfValues){
    //Replace bind variables with values
    for (var i = 0; i < bindVariableArray.length; ++i) {
      var stillExists = sqlstr.indexOf(bindVariableArray[i]);
      while (stillExists !== -1){
        sqlstr = sqlstr.replace(bindVariableArray[i],swapValues[i]);
        stillExists = sqlstr.indexOf(bindVariableArray[i]);
      }
    }
    if (tools.stringStartsWithSelect(sqlstr)===false){return callback('SQL Statement Rejected: SQL Statments must begin with the word \"SELECT\" ','error');}
    if (tools.rejectInject(sqlstr)!==false){return callback('SQL Statement Rejected: The following SQL phrases are not allowed: '+ tools.rejectInject(sqlstr),'error');}
    return callback(null,sqlstr);

}

/******************************************************************
A simple json detetctor
*******************************************************************/
exports.isJson = function(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
};

/******************************************************************
Reads a group of json files (from an array of given path
statements) and returns the first object that matches the
given name
*******************************************************************/
exports.fetchInputs = function(name,libraries){

 //create a return promise-------------
  return new Promise(function(resolve, reject){
  //some error handling----------------
    //if name or libraries are undefined
    if (name === undefined || libraries === undefined){
      reject('Inputs for both \"Name\" and \"Libraries\" must not be undefined');}
    //if name or libraries are blank
    if(name.length === 0 || libraries.length === 0){
      reject('Inputs for both \"Name\" and \"Libraries\" must not be blank');}
    //if name is not a string
    if (name.constructor  !== String) {
      reject('The \"Name\" input must be a String');}
    //if libraries is not an array
    if (libraries.constructor !== Array) {
      reject('The \"Libraries\" input must be an Array');}

    let response;
    //loop through json text file line by line
    for (let i = 0; i < libraries.length; i++){
      //if file not found handle
      try{
      if (fs.statSync(libraries[i])){};
      }
      catch(e)
      {reject('The following file was not found: '+libraries[i]);}
      //if file exists...
      let planFile = fs.readFileSync(libraries[i]).toString().split("\n"),
          obj,
          string = '';
     //Append each new line to the next in string var
      for(let line in planFile) {
        string = (string.concat(planFile[line]));
      }
      if (string.length === 0){reject(name +' not found');}
     //If string var is JSON....
      if (tools.isJson(string)===true) {
        obj = JSON.parse(string);
       //Search for name
        for (let j = 0 ; j < obj.length; j++){
          if(Object.keys(obj[j])==name){
            response = obj[j][Object.keys(obj[j])];
          }
        }
      }else{
         reject('Library files must be in JSON format');
      }
    }
    //If no data returned
    if (response === undefined) {reject('\"'+name+'\" not found')};
  //return data upon success-----------
    resolve(response);
  });
};


/******************************************************************
Parses a Db Statement and returns all bind variable names
(i.e. any word that preceeds a colon ":") within that
Statment
*******************************************************************/
exports.fetchBindVariableNames = function(dbStatement,callback) {
  //err if dbStatement is not a string
  if (dbStatement.constructor != String)
    {return callback('Db Statement must be a string',undefined);}
  //Use regex to filter for bind variables in the dbStatement
  var bindVariableExtract = dbStatement.match(/\B:[\w]+/g);
  //if no bind variables detected, return null
  if (bindVariableExtract === null)
    {return callback(undefined,null);
  }else{
    var bindVariablesNames = [],
        bindVariableObj={};
    //Collect, format, and remove duplicates
        for (var i = 0; i < bindVariableExtract.length; i++) {
          if (bindVariablesNames.indexOf(bindVariableExtract[i].substr(1)) === -1) {
            bindVariablesNames.push(bindVariableExtract[i].substr(1));
          }
        }
    return callback(undefined,bindVariablesNames);
  }
}

/******************************************************************
Set defaults or apply overides to transactionObject
*******************************************************************/
exports.setProperties = function (transactionObjOverides, transactionObject,defaultValue) {
  //-------------Bind Variables
    if (!transactionObjOverides.bindVariables) {
      if (!transactionObject["bindVariables"]) {
        Object.assign(transactionObject,{"bindVariables":{}});
      }
    }else{Object.assign(transactionObject,{"bindVariables":transactionObjOverides.bindVariables});}
  //-------------Output Format
    if (!transactionObjOverides.outputFormat) {
      if (!transactionObject["outputFormat"]) {
        Object.assign(transactionObject,{"outputFormat":defaultValue.outputFormat});
      }
    }else{Object.assign(transactionObject,{"outputFormat":transactionObjOverides.outputFormat});}
  //-------------Zero Row Message
    if (!transactionObjOverides.zeroRowMessage) {
      if (!transactionObject["zeroRowMessage"]) {
        Object.assign(transactionObject,{"zeroRowMessage":defaultValue.zeroRowMessage});
      }
    }else{Object.assign(transactionObject,{"zeroRowMessage":transactionObjOverides.zeroRowMessage});}
  //-------------Row Limit
    if (!transactionObjOverides.maxRowsReturned) {
      if (!transactionObject["maxRowsReturned"]) {
        Object.assign(transactionObject,{"maxRowsReturned":defaultValue.maxRowsReturned});
      }
    }else{Object.assign(transactionObject,{"maxRowsReturned":transactionObjOverides.maxRowsReturned});}
  //-------------Response Output
    if (!transactionObjOverides.responseOutput) {
      if (!transactionObject["responseOutput"]) {
        Object.assign(transactionObject,{"responseOutput":defaultValue.responseOutput});
      }
    }else{Object.assign(transactionObject,{"responseOutput":transactionObjOverides.responseOutput});}
  //-------------Time Zone
    if (!transactionObjOverides.timeZone) {
      if (!transactionObject["timeZone"]) {
        Object.assign(transactionObject,{"timeZone":defaultValue.timeZone});
      }
    }else{Object.assign(transactionObject,{"timeZone":transactionObjOverides.timeZone});}
  }

/******************************************************************
Build connection string and append to connectionObject
*******************************************************************/
exports.setConnectionString = function(connectionObject,callback){

      //some validation of connection Object: host port and service or SID must be present
      if (connectionObject.host && connectionObject.port && connectionObject.service ||
          connectionObject.host && connectionObject.port && connectionObject.SID){
        //host and service (or SID) must be a string, and port must be a number
        if(connectionObject.service.constructor, connectionObject.host.constructor === String && connectionObject.port.constructor === Number||
           connectionObject.SID.constructor, connectionObject.host.constructor === String && connectionObject.port.constructor === Number){
          //append new connectionString to connectionObject
          for(var key in connectionObject){
            if(connectionObject.hasOwnProperty(key)){
              if(key==="service"){
                Object.assign(connectionObject,
                 {"connectString" : connectionObject.host+':'+ connectionObject.port+'/'+connectionObject.service}
                );
              }
              if(key==="SID"){
                Object.assign(connectionObject,
                 {"connectString" : connectionObject.host+':'+ connectionObject.port+'/'+connectionObject.SID}
                );
              }
            }
          }

        }else{
          return callback('Failed to build connection string. Check Host, Port, and either Service or SID formats. Port must be a number, and Host and Service or SID must be a string.');
        }
      }else{
        return callback('Each Connection must have it\'s own defined values for Host, Port, and either Service or SID','Each Connection must have it\'s own defined values for Host, Port, and either Service or SID.');
      }
}

/******************************************************************
Takes a connection object and returns Connection Info from a
specified javascript file
*******************************************************************/
exports.fetchConnectionInputs = function (connObj) {
  //create a: "return connection inputs promise"
  return new Promise(function(resolve, reject){
    //run "fetchInputs" function
    //console.log(connectionObject);
    tools.fetchInputs(
      connObj.connection,
      connObj.connectionLibraries
    )
    //collect results upon "fetchInputs" success
    .then(function(connectionObject){
         resolve(connectionObject);
      })
      //1)catch errors from "fetchInputs" call
      //2)rebrand error as a "Connection not found"
      .catch(function(err){
        if(err){
          if (err === 'No inputs not found') {
            reject('Connection not found');
          }else{
            reject(err);
          }
        }
      })
    })
}
