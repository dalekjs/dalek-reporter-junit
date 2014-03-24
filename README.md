dalek-reporter-junit
====================

> DalekJS reporter plugin for jUnit  compatible output

[![Build Status](https://travis-ci.org/dalekjs/dalek-reporter-junit.png)](https://travis-ci.org/dalekjs/dalek-reporter-junit)
[![Build Status](https://drone.io/github.com/dalekjs/dalek-reporter-junit/status.png)](https://drone.io/github.com/dalekjs/dalek-reporter-junit/latest)
[![Dependency Status](https://david-dm.org/dalekjs/dalek-reporter-junit.png)](https://david-dm.org/dalekjs/dalek-reporter-junit)
[![devDependency Status](https://david-dm.org/dalekjs/dalek-reporter-junit/dev-status.png)](https://david-dm.org/dalekjs/dalek-reporter-junit#info=devDependencies)
[![NPM version](https://badge.fury.io/js/dalek-reporter-junit.png)](http://badge.fury.io/js/dalek-reporter-junit)
[![Coverage](http://dalekjs.com/package/dalek-reporter-junit/master/coverage/coverage.png)](http://dalekjs.com/package/dalek-reporter-junit/master/coverage/index.html)
[![unstable](https://rawgithub.com/hughsk/stability-badges/master/dist/unstable.svg)](http://github.com/hughsk/stability-badges)
[![Stories in Ready](https://badge.waffle.io/dalekjs/dalek-reporter-junit.png?label=ready)](https://waffle.io/dalekjs/dalek-reporter-junit)
[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/dalekjs/dalek-reporter-junit/trend.png)](https://bitdeli.com/free "Bitdeli Badge")
[![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)

[![NPM](https://nodei.co/npm/dalek-reporter-junit.png)](https://nodei.co/npm/dalek-reporter-junit/)
[![NPM](https://nodei.co/npm-dl/dalek-reporter-junit.png)](https://nodei.co/npm/dalek-reporter-junit/)

## Ressources

[API Docs](http://dalekjs.com/package/dalek-reporter-junit/master/api/index.html) -
[Trello](https://trello.com/b/dKvjVE0x/dalek-reporter-junit) -
[Code coverage](http://dalekjs.com/package/dalek-reporter-junit/master/coverage/index.html) -
[Code complexity](http://dalekjs.com/package/dalek-reporter-junit/master/complexity/index.html) -
[Contributing](https://github.com/dalekjs/dalek-reporter-junit/blob/master/CONTRIBUTING.md) -
[User Docs](http://dalekjs.com/docs/junit.html) -
[Homepage](http://dalekjs.com) -
[Twitter](http://twitter.com/dalekjs)

## Docs

The jUnit reporter can produce a jUnit compatible file with the results of your testrun,
this reporter enables you to use daleks testresults within a CI environment like Jenkins.

The reporter can be installed with the following command:
```
$ npm install dalek-reporter-junit --save-dev
```

The file will follow the jUnit XML format:

```html
<?xml version="1.0" encoding="utf-8"?>
<resource name="DalekJSTest">
    <testsuite start="1375125067" name="Click - DalekJS guinea pig [Phantomjs]" end="1375125067" totalTests="0">
        <testcase start="1375125067" name="Can click a select option (OK, jQuery style, no message)" end="null" result="null">
            <variation start="1375125067" name="val" end="1375125067">
                <severity>pass</severity>
                <description>&lt;![CDATA[David is the favourite]]&gt;</description>
                <resource>DalekJSTest</resource>
            </variation>
            <variation start="1375125067" name="val" end="null">
                <severity>pass</severity>
                <description>&lt;![CDATA[Matt is now my favourite, bow ties are cool]]&gt;</description>
                <resource>DalekJSTest</resource>
            </variation>
        </testcase>
    </testsuite>
 </resource>
```

By default the file will be written to `report/dalek.xml`,
you can change this by adding a config option to the your Dalekfile

```javascript
"junit-reporter": {
  "dest": "your/folder/your_file.xml"
}
```

## Help Is Just A Click Away

### #dalekjs on FreeNode.net IRC

Join the `#daleksjs` channel on [FreeNode.net](http://freenode.net) to ask questions and get help.

### [Google Group Mailing List](https://groups.google.com/forum/#!forum/dalekjs)

Get announcements for new releases, share your projects and ideas that are
using DalekJS, and join in open-ended discussion that does not fit in
to the Github issues list or StackOverflow Q&A.

**For help with syntax, specific questions on how to implement a feature
using DalekJS, and other Q&A items, use StackOverflow.**

### [StackOverflow](http://stackoverflow.com/questions/tagged/dalekjs)

Ask questions about using DalekJS in specific scenarios, with
specific features. For example, help with syntax, understanding how a feature works and
how to override that feature, browser specific problems and so on.

Questions on StackOverflow often turn in to blog posts or issues.

### [Github Issues](//github.com/dalekjs/dalek-reporter-junit/issues)

Report issues with DalekJS, submit pull requests to fix problems, or to
create summarized and documented feature requests (preferably with pull
requests that implement the feature).

**Please don't ask questions or seek help in the issues list.** There are
other, better channels for seeking assistance, like StackOverflow and the
Google Groups mailing list.

![DalekJS](https://raw.github.com/dalekjs/dalekjs.com/master/img/logo.png)

## Legal FooBar (MIT License)

Copyright (c) 2013 Sebastian Golasch

Distributed under [MIT license](https://github.com/dalekjs/dalek-reporter-junit/blob/master/LICENSE-MIT)