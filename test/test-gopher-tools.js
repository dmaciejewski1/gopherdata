/*****************************************************************
  NAME: test-gopher-tools.js
  PATH: test/test-gopher-tools.js
  WHAT: Unit tests for "gopher-tools.js"
******************************************************************/
"use strict";
var chai = require("chai");
var chaiAsPromised = chai.use(require("chai-as-promised"));
var tools = require('../lib/gopher-tools.js');
var should = chai.should();
var expect = chai.expect;


describe('Testing the \"gopher-tools.js\" library...', function(){

//-----------------------------------isJson-----------------------------------//
  describe('The \"isJson\" function:', function(){
      it('returns \"true\" when given a JSON string', function (){
        let jsonTestString = "[{\"key1\":\"value1\",\"key2\":2,\"key3\":null,\"key4\":[\"index1\",\"index2\",3],\"key5\":{\"sub1\":\"subvalue1\",\"sub2\":2,\"sub3\":null}},[\"something\",\"here\"],1]";
        tools.isJson(jsonTestString).should.eql(true);
      })

      it('returns \"false\" when given a non JSON string', function (){
        let jsonTestString = "[{key1:\"value1\"}]";
        tools.isJson(jsonTestString).should.eql(false);
      })

  })

//---------------------------------fetchInputs--------------------------------//
  describe('The \"fetchInputs\" function:', function(){
    let name = 'testDb-Prod';
    let libraries = ['./test/connections-example1.json'];
    let expectedResult = {
      user       : 'testUser',
      password   : 'testPassword',
      host       : 'test.db.com',
      port       : 12345,
      service    : 'test.proddb.com',
      transactionLibraries: ['./test']};

    it('can retrieve an object from a json file given \"Name\" and \"Libraries\" inputs', function (){
      return Promise.resolve(
        tools.fetchInputs(name,libraries)
      )
        .should.eventually.eql(expectedResult);
      })


    it('returns an error if the value for the "Name" input is left blank', function (){
      let name = '';
      let libraries = ['./test/connections-example1.json'];
      let expectedResult = 'Inputs for both \"Name\" and \"Libraries\" must not be blank';
      return Promise.resolve(
        tools.fetchInputs(name,libraries)
      )
        .should.be.rejectedWith(expectedResult);
    })

    it('returns an error if the value for the "Libraries" input is left blank', function (){
      let name = 'testDb-Prod';
      let libraries = '';
      let expectedResult = 'Inputs for both \"Name\" and \"Libraries\" must not be blank';
      return Promise.resolve(
        tools.fetchInputs(name,libraries)
      )
        .should.be.rejectedWith(expectedResult);
    })

    it('returns an error if the value for the "Name" input is undefined', function (){
      let name = undefined;
      let libraries = ['./test/connections-example1.json'];
      let expectedResult = 'Inputs for both \"Name\" and \"Libraries\" must not be undefined';
      return Promise.resolve(
        tools.fetchInputs(name,libraries)
      )
        .should.be.rejectedWith(expectedResult);
    })

    it('returns an error if the value for the "Libraries" input is undefined', function (){
      let name = 'testDb-Prod';
      let libraries = undefined;
      let expectedResult = 'Inputs for both \"Name\" and \"Libraries\" must not be undefined';
      return Promise.resolve(
        tools.fetchInputs(name,libraries)
      )
        .should.be.rejectedWith(expectedResult);
    })

    it('returns an error if the value for the "Libraries" input is not an array', function (){
      let name = 'testDb-Prod';
      let libraries = './test/connections-example1.json';
      let expectedResult = 'The \"Libraries\" input must be an Array';
      return Promise.resolve(
        tools.fetchInputs(name,libraries)
      )
        .should.be.rejectedWith(expectedResult);
    })

    it('returns an error if the value for the "Name" input is not a string', function (){
      let name = ['testDb-Prod'];
      let libraries = ['./test/connections-example1.json'];
      let expectedResult = 'The \"Name\" input must be a String';
      return Promise.resolve(
        tools.fetchInputs(name,libraries)
      )
        .should.be.rejectedWith(expectedResult);
    })

    it('returns an error if the \"Library\" file parsed is not in JSON format', function (){
      let name = 'testDb-Prod';
      let libraries = ['./test/connections-example-nonJson.json'];
      let expectedResult = 'Library files must be in JSON format';
      return Promise.resolve(
        tools.fetchInputs(name,libraries)
      )
        .should.be.rejectedWith(expectedResult);
    })

    it('returns an error if value for the \"Name\" input is not found within the libraries parced', function (){
      let name = 'testDb';
      let libraries = ['./test/connections-example1.json'];
      let expectedResult = '\"'+name+'\" not found';
      return Promise.resolve(
        tools.fetchInputs(name,libraries)
      )
        .should.be.rejectedWith(expectedResult);
    })

    it('returns an error if a Library file is not found', function (){
      let name = 'testDb';
      let libraries = ['./test/connections.json'];
      let expectedResult = 'The following file was not found: ./test/connections.json';
      return Promise.resolve(
        tools.fetchInputs(name,libraries).catch()
      )
        .should.be.rejectedWith(expectedResult);
    })


  })

//---------------------------stringStartsWithSelect---------------------------//
  describe('The \"stringStartsWithSelect\" function:', function(){
    it('returns false if input sqlStatement does not begin with the word \"select\"', function (){
      let selectStmt = 'insert * from dual';
      tools.stringStartsWithSelect(selectStmt).should.eql(false);
    })

    it('returns true if input sqlStatement begins with the word \"select\"', function (){
      let selectStmt = 'select * from dual';
      tools.stringStartsWithSelect(selectStmt).should.eql(true);
    })

})

  //--------------------------------rejectInject--------------------------------//
  describe('The \"rejectInject\" function:', function(){
    it('returns \"false\" when no restricted phrase patterns detected', function (){
      let sqlStatement = 'SELECT someColumn FROM someTable WHERE oneThing = anotherThing';
      let expectedResult = false;
      tools.rejectInject(sqlStatement).should.eql(expectedResult);
    })
    //---REMOVAL---
    describe('for \"Removal\" type patterns', function(){
      it('returns \"\[\'tRunCate  tAble\'\]\" when a \"Truncate Table\" pattern is detected', function (){
        let sqlStatement = 'SELECT someColumn FROM someTable WHERE oneThing = anotherThing; tRunCate  tAble  someTable;';
        let expectedResult = ['tRunCate  tAble'];
        tools.rejectInject(sqlStatement).should.eql(expectedResult);
      })

      it('returns \"\[\'drOp  tAble\'\]\" when a \"Drop Table\" pattern is detected', function (){
        let sqlStatement = 'SELECT someColumn FROM someTable WHERE oneThing = anotherThing; drOp  tAble  someTable;';
        let expectedResult = ['drOp  tAble'];
        tools.rejectInject(sqlStatement).should.eql(expectedResult);
      })

      it('returns \"\[\'drOp  pRoCedurE\'\]\" when a \"Drop Procedure\" pattern is detected', function (){
        let sqlStatement = 'SELECT someColumn FROM someTable WHERE oneThing = anotherThing; drOp  pRoCedurE  someProcedure;';
        let expectedResult = ['drOp  pRoCedurE'];
        tools.rejectInject(sqlStatement).should.eql(expectedResult);
      })

      it('returns \"\[\'drOP  PaCkAGe\'\]\" when a \"Drop Package\" pattern is detected', function (){
        let sqlStatement = 'SELECT someColumn FROM someTable WHERE oneThing = anotherThing; drOP  PaCkAGe  somePackage;';
        let expectedResult = ['drOP  PaCkAGe'];
        tools.rejectInject(sqlStatement).should.eql(expectedResult);
      })

      it('returns \"\[\'drOP  fUNctioN\'\]\" when a \"Drop Function\" pattern is detected', function (){
        let sqlStatement = 'SELECT someColumn FROM someTable WHERE oneThing = anotherThing; drOP  fUNctioN  someFunction;';
        let expectedResult = ['drOP  fUNctioN'];
        tools.rejectInject(sqlStatement).should.eql(expectedResult);
      })

      it('returns \"\[\'drOP INDEX\'\]\" when a \"Drop Index\" pattern is detected', function (){
        let sqlStatement = 'SELECT someColumn FROM someTable WHERE oneThing = anotherThing; drOP INDEX  someIndex;';
        let expectedResult = ['drOP INDEX'];
        tools.rejectInject(sqlStatement).should.eql(expectedResult);
      })

      it('returns \"\[\'drOP  bITmAp  IndeX\'\]\" when a \"Drop Bitmap Index\" pattern is detected', function (){
        let sqlStatement = 'SELECT someColumn FROM someTable WHERE oneThing = anotherThing; drOP  bITmAp  IndeX  someBitmap Index;';
        let expectedResult = ['drOP  bITmAp  IndeX'];
        tools.rejectInject(sqlStatement).should.eql(expectedResult);
      })

      it('returns \"\[\'drOP  uniQue  InDEX\'\]\" when a \"Drop Unique Index\" pattern is detected', function (){
        let sqlStatement = 'SELECT someColumn FROM someTable WHERE oneThing = anotherThing; drOP  uniQue  InDEX  someUniqueIndex;';
        let expectedResult = ['drOP  uniQue  InDEX'];
        tools.rejectInject(sqlStatement).should.eql(expectedResult);
      })

      it('returns \"\[\'drOP   MATeriAlized  VIEW\'\]\" when a \"Drop Materialized View\" pattern is detected', function (){
        let sqlStatement = 'SELECT someColumn FROM someTable WHERE oneThing = anotherThing; drOP   MATeriAlized  VIEW  someMaterializedView;';
        let expectedResult = ['drOP   MATeriAlized  VIEW'];
        tools.rejectInject(sqlStatement).should.eql(expectedResult);
      })

      it('returns \"\[\'drOP   VIEW\'\]\" when a \"Drop View\" pattern is detected', function (){
        let sqlStatement = 'SELECT someColumn FROM someTable WHERE oneThing = anotherThing; drOP   VIEW  someView;';
        let expectedResult = ['drOP   VIEW'];
        tools.rejectInject(sqlStatement).should.eql(expectedResult);
      })

      it('returns \"\[\'drOP   tRigGer\'\]\" when a \"Drop Trigger\" pattern is detected', function (){
        let sqlStatement = 'SELECT someColumn FROM someTable WHERE oneThing = anotherThing; drOP   tRigGer  someTrigger;';
        let expectedResult = ['drOP   tRigGer'];
        tools.rejectInject(sqlStatement).should.eql(expectedResult);
      })

      it('returns \"\[\'drOP   tYpE\'\]\" when a \"Drop Type\" pattern is detected', function (){
        let sqlStatement = 'SELECT someColumn FROM someTable WHERE oneThing = anotherThing; drOP   tYpE  someType;';
        let expectedResult = ['drOP   tYpE'];
        tools.rejectInject(sqlStatement).should.eql(expectedResult);
      })

      it('returns \"\[\'pUrGE tABlE\'\]\" when a \"Purge Table\" pattern is detected', function (){
        let sqlStatement = 'SELECT someColumn FROM someTable; pUrGE tABlE; SELECT someColumn FROM someTable WHERE oneThing = anotherThing';
        let expectedResult = ['pUrGE tABlE'];
        tools.rejectInject(sqlStatement).should.eql(expectedResult);
      })

      it('returns \"\[\'pUrGE  rECYCleBiN\'\]\" when a \"Purge Recyclebin\" pattern is detected', function (){
        let sqlStatement = 'SELECT someColumn FROM someTable; pUrGE  rECYCleBiN; SELECT someColumn FROM someTable WHERE oneThing = anotherThing';
        let expectedResult = ['pUrGE  rECYCleBiN'];
        tools.rejectInject(sqlStatement).should.eql(expectedResult);
      })

      it('returns \"\[\'dEleTE   FROm\'\]\" when a \"Delete Type\" pattern is detected', function (){
        let sqlStatement = 'SELECT someColumn FROM someTable WHERE oneThing = anotherThing; dEleTE   FROm someTable...';
        let expectedResult = ['dEleTE   FROm'];
        tools.rejectInject(sqlStatement).should.eql(expectedResult);
      })
   })
   //---DDL---
    describe('for \"DDL\" type patterns', function(){
      it('returns \"\[\'CREATE  or  REPLACE\'\]\" when a \"Create Or Replace\" pattern is detected', function (){
        let sqlStatement = 'SELECT someColumn FROM someTable WHERE oneThing = anotherThing; CREATE  or  REPLACE  someFunction...';
        let expectedResult = ['CREATE  or  REPLACE'];
        tools.rejectInject(sqlStatement).should.eql(expectedResult);
      })

      it('returns \"\[\'CReAtE  TaBLe\'\]\" when a \"Create Table\" pattern is detected', function (){
        let sqlStatement = 'SELECT someColumn FROM someTable WHERE oneThing = anotherThing; CReAtE  TaBLe  SOMETABLE (someColumn varchar2(20 BYTE));...';
        let expectedResult = ['CReAtE  TaBLe'];
        tools.rejectInject(sqlStatement).should.eql(expectedResult);
      })

      it('returns \"\[\'AlTeR  TaBLe\'\]\" when a \"Alter Table\" pattern is detected', function (){
        let sqlStatement = 'SELECT someColumn FROM someTable WHERE oneThing = anotherThing; AlTeR  TaBLe  SOMETABLE (someColumn varchar2(20 BYTE));...';
        let expectedResult = ['AlTeR  TaBLe'];
        tools.rejectInject(sqlStatement).should.eql(expectedResult);
      })

      it('returns \"\[\'CreAtE  pRoCedurE\'\]\" when a \"Create Procedure\" pattern is detected', function (){
        let sqlStatement = 'SELECT someColumn FROM someTable WHERE oneThing = anotherThing; CreAtE  pRoCedurE  someProcedure...';
        let expectedResult = ['CreAtE  pRoCedurE'];
        tools.rejectInject(sqlStatement).should.eql(expectedResult);
      })

      it('returns \"\[\'CreAtE  PaCkAGe\'\]\" when a \"Create Package\" pattern is detected', function (){
        let sqlStatement = 'SELECT someColumn FROM someTable WHERE oneThing = anotherThing; CreAtE  PaCkAGe  somePackage...';
        let expectedResult = ['CreAtE  PaCkAGe'];
        tools.rejectInject(sqlStatement).should.eql(expectedResult);
      })

      it('returns \"\[\'CreAtE  fUNctioN\'\]\" when a \"Create Function\" pattern is detected', function (){
        let sqlStatement = 'SELECT someColumn FROM someTable WHERE oneThing = anotherThing; CreAtE  fUNctioN  someFunction...';
        let expectedResult = ['CreAtE  fUNctioN'];
        tools.rejectInject(sqlStatement).should.eql(expectedResult);
      })

      it('returns \"\[\'CreAtE   INDEX\'\]\" when a \"Create Index\" pattern is detected', function (){
        let sqlStatement = 'SELECT someColumn FROM someTable WHERE oneThing = anotherThing; CreAtE INDEX  someIndex...';
        let expectedResult = ['CreAtE INDEX'];
        tools.rejectInject(sqlStatement).should.eql(expectedResult);
      })

      it('returns \"\[\'AlTer   INDEX  indexName   reBuIld\'\]\" when a \"Alter Index...Rebuild\" pattern is detected', function (){
        let sqlStatement = 'SELECT someColumn FROM someTable WHERE oneThing = anotherThing; AlTer   INDEX  indexName   reBuIld...';
        let expectedResult = ['AlTer   INDEX  indexName   reBuIld'];
        tools.rejectInject(sqlStatement).should.eql(expectedResult);
      })

      it('returns \"\[\'AlTer   INDEX  indexName   reNaMe\'\]\" when a \"Alter Index...Rename\" pattern is detected', function (){
        let sqlStatement = 'SELECT someColumn FROM someTable WHERE oneThing = anotherThing; AlTer   INDEX  indexName   reNaMe...';
        let expectedResult = ['AlTer   INDEX  indexName   reNaMe'];
        tools.rejectInject(sqlStatement).should.eql(expectedResult);
      })

      it('returns \"\[\'CreAtE  bITmAp  IndeX\'\]\" when a \"Create Bitmap Index\" pattern is detected', function (){
        let sqlStatement = 'SELECT someColumn FROM someTable WHERE oneThing = anotherThing; CreAtE  bITmAp  IndeX  someBitmap Index...';
        let expectedResult = ['CreAtE  bITmAp  IndeX'];
        tools.rejectInject(sqlStatement).should.eql(expectedResult);
      })

      it('returns \"\[\'CreAtE  uniQue  InDEX\'\]\" when a \"Create Unique Index\" pattern is detected', function (){
        let sqlStatement = 'SELECT someColumn FROM someTable WHERE oneThing = anotherThing; CreAtE  uniQue  InDEX  someUniqueIndex...';
        let expectedResult = ['CreAtE  uniQue  InDEX'];
        tools.rejectInject(sqlStatement).should.eql(expectedResult);
      })

      it('returns \"\[\'CreAtE   mAtErializEd  View\'\]\" when a \"Create Materialized View\" pattern is detected', function (){
        let sqlStatement = 'SELECT someColumn FROM someTable WHERE oneThing = anotherThing; CreAtE   mAtErializEd  View  someMaterializedView...';
        let expectedResult = ['CreAtE   mAtErializEd  View'];
        tools.rejectInject(sqlStatement).should.eql(expectedResult);
      })

      it('returns \"\[\'CreAtE  View\'\]\" when a \"Create View\" pattern is detected', function (){
        let sqlStatement = 'SELECT someColumn FROM someTable WHERE oneThing = anotherThing; CreAtE  View  someView...';
        let expectedResult = ['CreAtE  View'];
        tools.rejectInject(sqlStatement).should.eql(expectedResult);
      })

      it('returns \"\[\'Alter  View\'\]\" when a \"Alter View\" pattern is detected', function (){
        let sqlStatement = 'SELECT someColumn FROM someTable WHERE oneThing = anotherThing; Alter  View  someView...';
        let expectedResult = ['Alter  View'];
        tools.rejectInject(sqlStatement).should.eql(expectedResult);
      })

      it('returns \"\[\'CreAtE  Trigger\'\]\" when a \"Create Trigger\" pattern is detected', function (){
        let sqlStatement = 'SELECT someColumn FROM someTable WHERE oneThing = anotherThing; CreAtE  Trigger  someTrigger...';
        let expectedResult = ['CreAtE  Trigger'];
        tools.rejectInject(sqlStatement).should.eql(expectedResult);
      })

      it('returns \"\[\'Alter  Trigger\'\]\" when a \"Alter Trigger\" pattern is detected', function (){
        let sqlStatement = 'SELECT someColumn FROM someTable WHERE oneThing = anotherThing; Alter  Trigger  someTrigger...';
        let expectedResult = ['Alter  Trigger'];
        tools.rejectInject(sqlStatement).should.eql(expectedResult);
      })

      it('returns \"\[\'CreAtE  TYPe someType aS\'\]\" when a \"Create Type\" pattern is detected', function (){
        let sqlStatement = 'SELECT someColumn FROM someTable WHERE oneThing = anotherThing; CreAtE  TYPe someType aS...';
        let expectedResult = ['CreAtE  TYPe someType aS'];
        tools.rejectInject(sqlStatement).should.eql(expectedResult);
      })

    })

    describe('for \"System\" type patterns', function(){

      it('returns \"\[\'AlTer   System    Set\'\]\" when a \"Alter System Set\" pattern is detected', function (){
        let sqlStatement = 'SELECT someColumn FROM someTable WHERE oneThing = anotherThing; AlTer   System    Set...';
        let expectedResult = ['AlTer   System    Set'];
        tools.rejectInject(sqlStatement).should.eql(expectedResult);
      })

      it('returns \"\[\'sHutDown    NorMal\'\]\" when a \"Shutdown Normal\" pattern is detected', function (){
        let sqlStatement = 'SELECT someColumn FROM someTable WHERE oneThing = anotherThing; sHutDown    NorMal...';
        let expectedResult = ['sHutDown    NorMal'];
        tools.rejectInject(sqlStatement).should.eql(expectedResult);
      })

      it('returns \"\[\'sHutDown   ImmEdIate\'\]\" when a \"Shutdown Immediate\" pattern is detected', function (){
        let sqlStatement = 'SELECT someColumn FROM someTable WHERE oneThing = anotherThing; sHutDown   ImmEdIate...';
        let expectedResult = ['sHutDown   ImmEdIate'];
        tools.rejectInject(sqlStatement).should.eql(expectedResult);
      })

      it('returns \"\[\'sHutDown   tRansActionAl\'\]\" when a \"Shutdown Transactional\" pattern is detected', function (){
        let sqlStatement = 'SELECT someColumn FROM someTable WHERE oneThing = anotherThing; sHutDown   tRansActionAl...';
        let expectedResult = ['sHutDown   tRansActionAl'];
        tools.rejectInject(sqlStatement).should.eql(expectedResult);
      })

      it('returns \"\[\'sHutDown   aBorT\'\]\" when a \"Shutdown Abort\" pattern is detected', function (){
        let sqlStatement = 'SELECT someColumn FROM someTable WHERE oneThing = anotherThing; sHutDown   aBorT...';
        let expectedResult = ['sHutDown   aBorT'];
        tools.rejectInject(sqlStatement).should.eql(expectedResult);
      })

    })

    describe('for \"DML\" type patterns', function(){

      it('returns \"\[\'UPDATE   someTable  SET\'\]\" when a \"Update...Set\" pattern is detected', function (){
        let sqlStatement = 'SELECT someColumn FROM someTable WHERE oneThing = anotherThing; UPDATE   someTable  SET...';
        let expectedResult = ['UPDATE   someTable  SET'];
        tools.rejectInject(sqlStatement).should.eql(expectedResult);
      })

      it('returns \"\[\'InsErT  InTo\'\]\" when a \"Insert Into\" pattern is detected', function (){
        let sqlStatement = 'SELECT someColumn FROM someTable WHERE oneThing = anotherThing; InsErT  InTo...';
        let expectedResult = ['InsErT  InTo'];
        tools.rejectInject(sqlStatement).should.eql(expectedResult);
      })

      it('returns \"\[\'InsErT  All  InTo\'\]\" when a \"Insert All Into\" pattern is detected', function (){
        let sqlStatement = 'SELECT someColumn FROM someTable WHERE oneThing = anotherThing; InsErT  All  InTo...';
        let expectedResult = ['InsErT  All  InTo'];
        tools.rejectInject(sqlStatement).should.eql(expectedResult);
      })

      it('returns \"\[\'MERGE  into  someTable  USING\'\]\" when a \"Merge Into...Using\" pattern is detected', function (){
        let sqlStatement = 'SELECT someColumn FROM someTable WHERE oneThing = anotherThing; MERGE  into  someTable  USING...';
        let expectedResult = ['MERGE  into  someTable  USING'];
        tools.rejectInject(sqlStatement).should.eql(expectedResult);
      })

      it('returns \"\[\'from   sys.table@\'\]\" when a \"From...@\" pattern is detected', function (){
        let sqlStatement = 'SELECT * from   sys.table@someDataBase...';
        let expectedResult = ['from   sys.table@'];
        tools.rejectInject(sqlStatement).should.eql(expectedResult);
      })

    })

    describe('for \"Anonymoys Block\" type patterns', function(){

      it('returns \"\[\'BEGIN null; SELECT * FROM DUAL; END;\'\]\" when a \"Merge Into...Using\" pattern is detected', function (){
        let sqlStatement = 'SELECT someColumn FROM someTable WHERE oneThing = anotherThing; BEGIN null; END;...';
        let expectedResult = ['BEGIN null; END'];
        tools.rejectInject(sqlStatement).should.eql(expectedResult);
      })

      it('returns \"\[\'sYS.\'\]\" when a \"SYS.\" pattern is detected', function (){
        let sqlStatement = 'SELECT someColumn FROM someTable WHERE oneThing = anotherThing; EXEC sYS.GET_OWNER(\'AAAA||CHR(DBMS_SQL.EXECUTE(4))--\');';
        let expectedResult = ['sYS.'];
        tools.rejectInject(sqlStatement).should.eql(expectedResult);
      })

      it('returns \"\[\'EXECUTE   ImmeDiaTe\'\]\" when a \"Execute Immediate\" pattern is detected', function (){
        let sqlStatement = 'SELECT someColumn FROM someTable WHERE oneThing = anotherThing; EXECUTE   ImmeDiaTe  someProcedure();';
        let expectedResult = ['EXECUTE   ImmeDiaTe'];
        tools.rejectInject(sqlStatement).should.eql(expectedResult);
      })

      it('returns \"\[\'&&\'\]\" when a \"&&...\" pattern is detected', function (){
        let sqlStatement = 'SELECT someColumn FROM someTable WHERE oneThing = anotherThing;SELECT * FROM &&1';
        let expectedResult = ['&&'];
        tools.rejectInject(sqlStatement).should.eql(expectedResult);
      })

    })

    describe('for \"Data Dictionary\" type patterns', function(){

      it('returns \"\[\'v$\'\]\" when a \"v$\" pattern is detected', function (){
        let sqlStatement = 'SELECT someColumn FROM someTable WHERE oneThing = anotherThing; SELECT * FROM v$SomeSysView';
        let expectedResult = ['v$'];
        tools.rejectInject(sqlStatement).should.eql(expectedResult);
      })

      it('returns \"\[\'FROM  someTable A,  all_\'\]\" when a \"From...All_\" pattern is detected', function (){
        let sqlStatement = 'SELECT * FROM  someTable A,  all_tables B;';
        let expectedResult = ['FROM  someTable A,  all_'];
        tools.rejectInject(sqlStatement).should.eql(expectedResult);
      })

      it('returns \"\[\'FROM  someTable A,  dba_\'\]\" when a \"From...DBA_\" pattern is detected', function (){
        let sqlStatement = 'SELECT * FROM  someTable A,  dba_tables B;';
        let expectedResult = ['FROM  someTable A,  dba_'];
        tools.rejectInject(sqlStatement).should.eql(expectedResult);
      })

      it('returns \"\[\'FROM  someTable A,  user_\'\]\" when a \"From...User_\" pattern is detected', function (){
        let sqlStatement = 'SELECT * FROM  someTable A,  user_tables B;';
        let expectedResult = ['FROM  someTable A,  user_'];
        tools.rejectInject(sqlStatement).should.eql(expectedResult);
      })

    })

  })

})
