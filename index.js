/*!
 *
 * Copyright (c) 2013 Sebastian Golasch
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 */

'use strict';

// ext. libs
var fs = require('fs');
var path = require('path');
var jsonxml = require('jsontoxml');

// int. global
var reporter = null;

/**
 * The jUnit reporter can produce a jUnit compatible file with the results of your testrun,
 * this reporter enables you to use daleks testresults within a CI environment like Jenkins.
 *
 * The reporter can be installed with the following command:
 *
 * ```bash
 * $ npm install dalek-reporter-junit --save-dev
 * ```
 *
 * The file will follow the jUnit XML format:
 *
 * ```html
 * <?xml version="1.0" encoding="utf-8"?>
 * <resource name="DalekJSTest">
 *     <testsuite start="1375125067" name="Click - DalekJS guinea pig [Phantomjs]" end="1375125067" totalTests="1">
 *         <testcase start="1375125067" name="Can click a select option (OK, jQuery style, no message)" end="1375125067" result="pass">
 *             <variation start="1375125067" name="val" end="1375125067">
 *                 <severity>pass</severity>
 *                 <description>&lt;![CDATA[David is the favourite]]&gt;</description>
 *                 <resource>DalekJSTest</resource>
 *             </variation>
 *             <variation start="1375125067" name="val" end="1375125067">
 *                 <severity>pass</severity>
 *                 <description>&lt;![CDATA[Matt is now my favourite, bow ties are cool]]&gt;</description>
 *                 <resource>DalekJSTest</resource>
 *             </variation>
 *         </testcase>
 *     </testsuite>
 *  </resource>
 * ```
 *
 * By default the file will be written to `report/dalek.xml`,
 * you can change this by adding a config option to the your Dalekfile
 *
 * ```javascript
 * "junit-reporter": {
 *   "dest": "your/folder/your_file.xml"
 * }
 * ```
 *
 * If you would like to use the reporter (in addition to the std. console reporter),
 * you can start dalek with a special command line argument
 *
 * ```bash
 * $ dalek your_test.js -r console,junit
 * ```
 *
 * or you can add it to your Dalekfile
 *
 * ```javascript
 * "reporter": ["console", "junit"]
 * ```
 *
 * @class Reporter
 * @constructor
 * @part JUnit
 * @api
 */

function Reporter (opts) {
  this.events = opts.events;
  this.config = opts.config;
  this.testCount = 0;
  this.testIdx = -1;
  this.variationCount = -1;
  this.data = {};
  this.data.tests = [];
  this.browser = null;

  var defaultReportFolder = 'report';
  this.dest = this.config.get('junit-reporter') && this.config.get('junit-reporter').dest ? this.config.get('junit-reporter').dest : defaultReportFolder;

  // prepare base xml
  this.xml = [
    {
      name: 'resource',
      attrs: {
        name:'DalekJSTest'
      },
      children: []
    }
  ];

  this.startListening();
}

/**
 * @module Reporter
 */

module.exports = function (opts) {
  if (reporter === null) {
    reporter = new Reporter(opts);
  }

  return reporter;
};

Reporter.prototype = {

  /**
   * Connects to all the event listeners
   *
   * @method startListening
   * @chainable
   */

  startListening: function () {
    this.events.on('report:run:browser', this.runBrowser.bind(this));
    this.events.on('report:assertion', this.assertion.bind(this));
    this.events.on('report:test:started', this.testStarted.bind(this));
    this.events.on('report:test:finished', this.testFinished.bind(this));
    this.events.on('report:runner:finished', this.runnerFinished.bind(this));
    this.events.on('report:testsuite:started', this.testsuiteStarted.bind(this));
    this.events.on('report:testsuite:finished', this.testsuiteFinished.bind(this));
    return this;
  },

  /**
   * Stores the current browser name
   *
   * @method runBrowser
   * @param {string} browser Browser name
   * @chainable
   */

  runBrowser: function (browser) {
    this.browser = browser;
    return this;
  },

  /**
   * Generates XML skeleton for testsuites
   *
   * @method testsuiteStarted
   * @param {string} name Testsuite name
   * @chainable
   */

  testsuiteStarted: function (name) {
    this.testCount = 0;
    this.testIdx++;
    this.xml[0].children.push({
      name: 'testsuite',
      children: [],
      attrs: {
        start: Math.round(new Date().getTime() / 1000),
        name: name + ' [' + this.browser + ']',
        end: null,
        totalTests: 0
      }
    });
    return this;
  },

  /**
   * Finishes XML skeleton for testsuites
   *
   * @method testsuiteFinished
   * @chainable
   */

  testsuiteFinished: function () {
    this.xml[0].children[this.testIdx].attrs.end = Math.round(new Date().getTime() / 1000);
    return this;
  },

  /**
   * Generates XML skeleton for an assertion
   *
   * @method assertion
   * @param {object} data Event data
   * @chainable
   */

  assertion: function (data) {
    var timestamp = Math.round(new Date().getTime() / 1000);
    this.xml[0].children[this.testIdx].children[this.testCount].children.push({
      name: 'variation',
      attrs: {
        start: timestamp,
        name: data.type,
        end: null
      },
      children: [
        {name: 'severity', text: (data.success ? 'pass' : 'fail') },
        {name: 'description', text: jsonxml.cdata((data.message ? data.message : 'Expected: ' + data.expected + 'Actual: ' + data.value)) },
        {name: 'resource', text: 'DalekJSTest'}
      ]
    });

    if (this.variationCount > -1 && this.xml[0].children[this.testIdx].children[this.testCount].children[this.variationCount]) {
      this.xml[0].children[this.testIdx].children[this.testCount].children[this.variationCount].attrs.end = timestamp;
    }

    this.variationCount++;
    return this;
  },

  /**
   * Generates XML skeleton for a testcase
   *
   * @method testStarted
   * @param {object} data Event data
   * @chainable
   */

  testStarted: function (data) {
    this.variationCount = -1;
    this.xml[0].children[this.testIdx].children.push({
      name: 'testcase',
      children: [],
      attrs: {
        start: Math.round(new Date().getTime() / 1000),
        name: data.name,
        end: null,
        result: null
      }
    });

    return this;
  },

  /**
   * Finishes XML skeleton for a testcase
   *
   * @method testFinished
   * @param {object} data Event data
   * @chainable
   */

  testFinished: function (data) {
    var timestamp = Math.round(new Date().getTime() / 1000);
    this.xml[0].children[this.testIdx].children[this.testCount].attrs.end = timestamp;
    this.xml[0].children[this.testIdx].children[this.testCount].attrs.result = data.status ? 'Passed' : 'Failed';

    if (this.variationCount > -1) {
      this.xml[0].children[this.testIdx].children[this.testCount].children[this.variationCount].attrs.end = timestamp;
    }

    this.testCount++;
    this.variationCount = -1;
    this.xml[0].children[this.testIdx].attrs.totalTests = this.testCount;
    return this;
  },

  /**
   * Finishes XML and writes file to the file system
   *
   * @method runnerFinished
   * @param {object} data Event data
   * @chainable
   */

  runnerFinished: function (data) {
    this.data.elapsedTime = data.elapsedTime;
    this.data.status = data.status;
    this.data.assertions = data.assertions;
    this.data.assertionsFailed = data.assertionsFailed;
    this.data.assertionsPassed = data.assertionsPassed;

    var contents = jsonxml(this.xml, {escape: true, removeIllegalNameCharacters: true, prettyPrint: true, xmlHeader: 'version="1.0" encoding="UTF-8"'});

    if (path.extname(this.dest) !== '.xml') {
      this.dest = this.dest + '/dalek.xml';
    }

    this.events.emit('report:written', {type: 'junit', dest: this.dest});
    this._recursiveMakeDirSync(path.dirname(this.dest.replace(path.basename(this.dest, ''))));
    fs.writeFileSync(this.dest, contents, 'utf8');
  },

  /**
   * Helper method to generate deeper nested directory structures
   *
   * @method _recursiveMakeDirSync
   * @param {string} path PAth to create
   */

  _recursiveMakeDirSync: function (path) {
    var pathSep = require('path').sep;
    var dirs = path.split(pathSep);
    var root = '';

    while (dirs.length > 0) {
      var dir = dirs.shift();
      if (dir === '') {
        root = pathSep;
      }
      if (!fs.existsSync(root + dir)) {
        fs.mkdirSync(root + dir);
      }
      root += dir + pathSep;
    }
  }
};
