# gopher
Develop, Organize and Execute database statements from within a Node.js environment against an Oracle Database

## Summary
Maintain and execute canned or dynamic DDL/DML statements that are stored within library files (in json format)
executed from a Node.js configured environment against an Oracle backend. Gopher helps keep track of Database
Connection and Transaction configurations while giving you handy data output options, and valuable feedback
about the process.

## Usage
Build and Configure Gophers to:
* access and retrieve information from your locally stored Connection and Transaction libraries
* facilitate connections with databases
* send and retrieve database transactions
* configure and serve data and metadata output
* abstract away details about database connections and transactions
* integrate with web-API development

## Requirements
* Node.js 5.6.0
* Oracle Instant Client

## Oracle Instant Client Setup
#### *A) Download*
1. Download the following **TWO** Oracle Instant Client Packages (here: http://www.oracle.com/technetwork/database/features/instant-client/index-097480.html ). Please make sure to download the correct packages for your system architecture (i.e. 64 bit vs 32 bit)

    * **Instant Client Package - Basic or Basic Lite**: Contains files required to run OCI, OCCI, and JDBC-OCI applications

    * **Instant Client Package - SDK**: Contains additional header files and an example makefile for developing Oracle applications with Instant Client

#### *B) Install (this example procedure is for Mac OS X 64bit ONLY)*

1. Locate Oracle Instant Client files and unzip to directory: ```~/oracle```
```
unzip instantclient-basic-macos.x64-11.2.0.4.0.zip -d ~/oracle
unzip instantclient-sdk-macos.x64-11.2.0.3.0.zip -d ~/oracle
```
2. Update your .bashrc file by appending and saving the following block of code:
```
##### Oracle Instant Client 11.2 #####
 export OCI_HOME=~/oracle/instantclient_11_2
 export OCI_LIB_DIR=~/oracle/lib
 export OCI_INC_DIR=$OCI_HOME/sdk/include
 export OCI_INCLUDE_DIR=$OCI_HOME/sdk/include
 export OCI_VERSION=11
 export DYLD_LIBRARY_PATH=$OCI_LIB_DIR
```
3. Create the following symbolic links from within your Instant Client directory (e.g. /oracle/instantclient_11_2):
```
cd /oracle/instantclient_11_2
ln -s libclntsh.dylib.11.1 libclntsh.dylib
ln -s libocci.dylib.11.1 libocci.dylib
```
4. Restart your Terminal application OR type the following ```source ~/.bashrc```

## Create a Simple Demo Application called "gopher-demo"
This will set up a basic model for operation  (Use to create gopher development patterns)

#### *A) Setup and Configure*

1. Initialize gopher-demo with npm:
```
npm init
```
2. After gopher-demo initialization is complete, install the gopherdata module using npm:
```
npm install gopherdata
```
3. From the gopher-demo main directory, create directories named "libraries/connection" from the main gopher-demo directory:
```
mkdir -p libraries/connection
```
4. From the gopher-demo main directory, create a directory in "libraries" named "libraries/transaction":
```
mkdir libraries/transaction
```
5. From the gopher-demo main directory, create a connection library (file) named finance-connections.json:
```
touch libraries/connection/finance-connections.json
```
6. From the gopher-demo main directory, create a transaction library (file) named oracle-dictionary-transactions.json:
```
touch libraries/transaction/oracle-dictionary-transactions.json
```
7. **CONFIGURE A CONNECTION LIBRARY** : Add the following code to libraries/connection/finance-connections.json and save:
```json
[
  {"finance-Prod" :{
        "user"                 : "me",
        "password"             : "myProdPassword",
        "host"                 : "databases.arecool.com",
        "port"                 : 12345,
        "service"              : "databases.arecool.com"
  }},
  {"finance-Dev" :{
        "user"                 : "me",
        "password"             : "myDevPassword",
        "host"                 : "financedatabases.arecooltoo.com",
        "port"                 : 12345,
        "SID"                  : "financedatabases.arecooltoo.com"
  }}
]
```
8. **CONFIGURE A TRANSACTION LIBRARY**: In this example, db-Tables and db-Columns are the names of the Transactions a gopher can retrieve and send from this particular library. Add the following code to libraries/transaction/oracle-dictionary-transactions.json and save:
```json
[
  {"db-Tables" :{
    "dbStatement"     : "SELECT a.object_name AS \"TABLE\" FROM sys.user_objects a INNER JOIN sys.user_all_tables b ON a.object_name = b.table_name WHERE a.object_type = 'TABLE' ORDER BY b.table_name",
    "zeroRowMessage"  : "No Tables found"
  }},
  {"db-Columns" :{
      "dbStatement"     : "SELECT column_name AS \"COLUMN\" FROM sys.user_tab_columns WHERE lower(table_name) = lower(:tableName)",
      "bindVariables"   : {"tableName":"dual"},
      "zeroRowMessage"  : "No columns found"

  }}
]
```
9. Add Transaction Libraries to Connections in the libraries/connection/finance-connections.json file *(uses only some of the example configuration above)*:
```json
[
  {"finance-Prod" :{
        "user"                 : "me",
        "password"             : "myProdPassword",
        "host"                 : "databases.arecool.com",
        "port"                 : 12345,
        "service"              : "databases.arecool.com",
        "transactionLibraries" : ["./libraries/transaction/oracle-dictionary-transactions.json",
                                  "./libraries/transaction/finance-production-transactions.json"]
  }},
  {"finance-Dev" :{
        "user"                 : "me",
        "password"             : "myDevPassword",
        "host"                 : "financedatabases.arecooltoo.com",
        "port"                 : 12345,
        "SID"                  : "financedatabases.arecooltoo.com",
        "transactionLibraries" : ["./libraries/transaction/oracle-dictionary-transactions.json",
                                  "./libraries/transaction/finance-development-transactions.json",
                                  "./libraries/transaction/myfinanceSandbox-transactions.json"]
  }}
]
```

#### *B) Build a Gopher*
Create a simple gopher that uses a stored transaction named "db-Tables" (found in the oracle-dictionary-transactions.json transaction library) to get a list of all tables names from the Finance Production Database (whose connection info can be found in the finance-connections.json connection library as "finance-Prod") *(uses only some of the example configuration above).*
1. From the gopher-demo main directory, create a gopher.js file:
```
touch gopher.js
```
2. Add the following code to the gopher.js file
 ```js
 "use strict";

 const Gopher = require('gopherdata');

 //Assign Gardens (Gopher vernacular for Db Connection Configurations)
 const CONNECTIONS = ['./libraries/connection/finance-connections.json',
                      './libraries/connection/myDatabase-connections.json'];
/*******************************************************************************
                             Create a generic Gopher         
********************************************************************************/

   var runGopher = function(dbConnection,transactionName,callback){

     // Add Transaction Properties here:
     let transactionObject = {transaction : transactionName};

     new Gopher({"connection":dbConnection,"connectionLibraries":CONNECTIONS})
       .run(transactionObject,
         function(err,res){
           if (err)  {
             return callback(err,res);
           }
           return callback(err,res);
         }
       );
   }
/*******************************************************************************
                             Send Gopher on it's way
********************************************************************************/

   runGopher('finance-Prod','db-Tables',
     function(gophErr, gophRes){
       if(gophErr){console.log(gophRes);}
     console.log(gophRes)
     }
   );
 ```

#### *C) Build a simple abstraction*
 Create a gopher-schema.js file and load it up with paths to your connection libraries, and build/standardize your transaction configuration types
##### I. Create a Gopher schema
 1. From the gopher-demo main directory, create a gopher-schema.js file:
 ```
 touch gopher-schema.js
 ```
 2. Add the following code to the gopher-schema.js file:
 ```js
 "use strict";
  const Gopher = require('gopherdata');

  //Assign Gardens (Gopher vernacular for Db Connection Configurations)
  const CONNECTIONS = ['./libraries/connection/myDatabase-connections.json',
                       './libraries/connection/corporate-connections.json',
                       './libraries/connection/finance-connections.json'];
/*******************************************************************************
    Create Different Gophers (i.e. a Gopher Schema) and Configure their     
    Transaction Properties                                                  
********************************************************************************/

   //--------------------Without Bind Variables--------------------
    exports.run = function(dbConnection,transactionName,callback){
      let transactionObject = {transaction : transactionName};

      new Gopher({"connection":dbConnection,"connectionLibraries":CONNECTIONS})
        .run(transactionObject,
          function(err,res){
            if (err)  {return callback(err,res);}
            return callback(err,res);
          }
        );
    }

   //----------------------With Bind Variables---------------------

    exports.runWBindVariables = function(dbConnection,transactionName,bindVariables,callback){

      let transactionObject = {
        transaction        : transactionName,
        bindVariables      : bindVariables
      };

      new Gopher({"connection":dbConnection,"connectionLibraries":CONNECTIONS})
        .run(transactionObject,
          function(err,res){
            if (err)  {return callback(err,res);}
            return callback(err,res);
          }
        );
    }

   //---------------------------Show SQL---------------------------

    exports.showSql = function(dbConnection,transactionName,callback){

      let transactionObject = {
        transaction        : transactionName,
        responseOutput     : ['sqlOnly']
      };

      new Gopher({"connection":dbConnection,"connectionLibraries":CONNECTIONS})
        .run(transactionObject,
          function(err,res){
            if (err) {return callback(err,res);}
            return callback(err,res);
          }
        );
    }

   //---------------------------Verbose----------------------------

    exports.runVerbose = function(dbConnection,transactionName,callback){

      let transactionObject = {
        transaction        : transactionName,
        responseOutput     : ['verbose']
      };

      new Gopher({"connection":dbConnection,"connectionLibraries":CONNECTIONS})
        .run(transactionObject,
          function(err,res){
            if (err) {return callback(err,res);}
            return callback(err,res);
          }
        );
    }

   //------------------------Get Db Tables-------------------------

    exports.getTables = function(dbConnection,callback){

      let transactionObject = {transaction  : 'db-Tables'};

      new Gopher({"connection":dbConnection,"connectionLibraries":CONNECTIONS})
        .run(transactionObject,
          function(err,res){
            if (err) {return callback(err,res);}
            return callback(err,res);
          }
        );
    }

   //------------------------Get Db Columns------------------------

    exports.getColumns = function(dbConnection,table,callback){

      let transactionObject = {
        transaction    : 'db-Columns',
        bindVariables  : {tableName:table}
      };

      new Gopher({"connection":dbConnection,"connectionLibraries":CONNECTIONS})
        .run(transactionObject,
          function(err,res){
            if (err)  {return callback(err,res);}
            return callback(err,res);
          }
        );
    }

   //--------------------------Modifiable--------------------------

    exports.runModifiable = function(dbConnection,transactionObject,callback){

      new Gopher({"connection":dbConnection,"connectionLibraries":CONNECTIONS})
        .run(transactionObject,
          function(err,res){
            if (err) {return callback(err,res);}
            return callback(err,res);
           }
         );
     }
```

##### II. Create some gopher calls:
 1. From the gopher-demo main directory, create a gophers.js file:
```
touch gophers.js
```
 2. Add the following code to the gophers.js file:
```js
"use strict";
var gopher = require('./gopher-schema.js');
/*******************************************************************************Send Gophers on their way
********************************************************************************/

   //--------------------Without bind variables--------------------

     let connectTo = 'myDatabase-Prod';
     let transactionToSend = 'db-Tables';

     gopher.run(connectTo,transactionToSend,
       function(gophErr, gophRes){
         if(gophErr){console.log(gophRes);}
         console.log(gophRes)
       }
     );

   //---------------------With bind variables---------------------

     let connectTo = 'finance-Prod';
     let transactionToSend = 'quarterly-report';
     let bindVariables = {
       region     : 'North America',
       division   : 'Sales',
       storeID    : '1234'

     };

     gopher.runWBindVariables(connectTo,transactionToSend, bindVariables,
       function(gophErr, gophRes){
         if(gophErr){console.log(gophRes);}
         console.log(gophRes)
       }
     );

   //---------------------View SQL Statement----------------------

     let connection = 'finance-Prod';
     let transaction = 'quarterly-report';

     gopher.showSql(connection,transaction,
       function(gophErr, gophRes){
         if(gophErr){console.log(gophRes);}
         console.log(gophRes)
       }
     );

   //---------------------View Database Tables---------------------

     let connectTo = 'myDatabase-Prod';

     gopher.getTables(connection,
       function(gophErr, gophRes){
         if(gophErr){console.log(gophRes);}
         console.log(gophRes)
       }
     );

   //----------------------View Table Columns----------------------

     let connectTo = 'myDatabase-Prod';
     let showColumnsFor = 'myFavoriteTable';

     gopher.getColumns(connectTo, showColumnsFor
       function(gophErr, gophRes){
         if(gophErr){console.log(gophRes);}
         console.log(gophRes)
       }
     );

   //--------------------------Modifiable--------------------------

     let connectTo = 'myDatabase-Prod';
     let transactionPlan = {
         transaction       :'quarterly-report'
        ,bindVariables     :{ region     : 'North America',
                              division   : 'Sales',
                              storeID    : '1234'}
        ,outputFormat      : 'object'
        ,maxRowsReturned   : 3000
        ,zeroRowMessage    : 'This quarterly report was not found.'
        ,responseOutput    : ['host','network','connection','dbStatement','error','dbResponse','metaData','metrics']
        ,timeZone          : 'local'
     };

     gopher.runModifiable(connectTo,transactionPlan,
       function(gophErr, gophRes){
         if(gophErr){console.log(gophRes);}
         console.log(gophRes)
       }
     );
  ```
