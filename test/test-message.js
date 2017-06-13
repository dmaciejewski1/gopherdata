/*****************************************************************
  NAME: test-gopher-tools.js
  PATH: test/test-gopher-tools.js
  WHAT: Unit tests for "gopher-tools.js"
******************************************************************/
"use strict";
const chai = require("chai");
const chaiAsPromised = chai.use(require("chai-as-promised"));
const should = chai.should();
const expect = chai.expect;
const GopherMessage = require('../lib/gopher-message.js')
const gopherMessage = new GopherMessage()


describe('Testing the \"gopher-message.js\" library...', function(){
  //describe('The \"gofigFileExists\" function:', function(){
      it('returns \"true\" when gofig.js file exists', function (){
        gopherMessage.gofigFileExists().should.eql(true);
      })

      // it('the gofigLocation constant should equal \"../../../.gofig.json\"', function (){
      //   gopherMessage.gofigFileExists().should.eql(true);
      // })

  //})
})
