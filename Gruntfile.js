module.exports = function (grunt) {
  'use strict';

  // check task runtime
  require('time-grunt')(grunt);

  // load generic configs
  var configs = require('dalek-build-tools');

  grunt.initConfig({

    // load module meta data
    pkg: grunt.file.readJSON('package.json'),

    // define a src set of files for other tasks
    src: {
      lint: [/*'Gruntfile.js',*/ 'index.js', 'test/*.js'],
      complexity: ['index.js'],
      test: ['test/*.js'],
      src: ['index.js']
    },

    // clean automatically generated helper files & docs
    clean: configs.clean,

    // speed up build by defining concurrent tasks
    concurrent: configs.concurrent,

    // linting
    jshint: configs.jshint,

    // testing
    mochaTest: configs.mocha,

    // code metrics
    complexity: configs.complexity,
    plato: configs.plato(grunt.file.readJSON('.jshintrc')),

    // api docs
    yuidoc: configs.yuidocs(),

    // up version, tag & commit
    bump: configs.bump({
      pushTo: 'git@github.com:dalekjs/dalek-reporter-junit.git',
      files: ['package.json', 'CONTRIBUTORS.md', 'CHANGELOG.md']
    }),

    // generate contributors file
    contributors: configs.contributors,

    // compress artifacts
    compress: configs.compress,

    // user docs
    documantix: {
      options: {
        header: 'dalekjs/dalekjs.com/master/assets/header.html',
        footer: 'dalekjs/dalekjs.com/master/assets/footer.html',
        target: 'report/docs',
        vars: {
          title: 'DalekJS - Documentation - Reporter - jUnit',
          desc: 'DalekJS - Documentation - Reporter - jUnit',
          docs: true
        }
      },
      src: ['index.js']
    },

    // prepare files for grunt-plato to
    // avoid error messages (weird issue...)
    preparePlato: {
      options: {
        folders: [
          'coverage',
          'report',
          'report/coverage',
          'report/complexity',
          'report/complexity/files',
          'report/complexity/files/index_js'
        ],
        files: [
          'report.history.json',
          'files/index_js/report.history.json'
        ]
      }
    },

    // prepare files & folders for coverage
    prepareCoverage: {
      options: {
        folders: ['coverage', 'report', 'report/coverage'],
        pattern: '[require("fs").realpathSync(__dirname + "/../index.js")]'
      }
    },

    // add current timestamp to the html document
    includereplace: {
      dist: {
        options: {
          globals: {
            timestamp: '<%= grunt.template.today("dddd, mmmm dS, yyyy, h:MM:ss TT") %>'
          },
        },
        src: 'report/docs/*.html',
        dest: './'
      }
    },

    // archive docs
    archive: {
      options: {
        files: ['junit.html']
      }
    },

    // release canary version
    'release-canary': {
      options: {
        files: []
      }
    }

  });

  // load 3rd party tasks
  require('load-grunt-tasks')(grunt);
  grunt.loadTasks('./node_modules/dalek-build-tools/tasks');

    // releases a new canary build
  grunt.registerTask('release-canary-debug', function () {
    var done = this.async();
    var pkg = grunt.config.get('pkg');
    var canaryPkg = grunt.util._.clone(pkg);
    var options = this.options();
    var cwd = process.cwd();
    var fileContents = {};

    // modify the package json
    Object.keys(canaryPkg.dependencies).forEach(function (pack) {
      if (pack.search('dalek') !== -1) {
        delete canaryPkg.dependencies[pack];
        canaryPkg.dependencies[pack + '-canary'] = 'latest';
      }
    });
    canaryPkg.name = canaryPkg.name + '-canary';
    canaryPkg.version = canaryPkg.version + '-' + grunt.template.today('yyyy-mm-dd-HH-MM-ss');
    grunt.file.write('package.json', JSON.stringify(canaryPkg, true, 2));

    // iterate over the given aray of files to edit
    options.files.forEach(function (file, idx){
      fileContents[idx] = {old: grunt.file.read(file), canary: grunt.file.read(file)};
      Object.keys(pkg.dependencies).forEach(function (pack) {
        if (pack.search('dalek') !== -1) {
          fileContents[idx].canary = fileContents[idx].canary.replace(pack, pack + '-canary');
        }
      });
      grunt.file.write(file, fileContents[idx].canary);
    });

    var npm = require('npm');
    npm.load({}, function() {

      console.log(process.env.npmuser, process.env.npmpass, process.env.npmmail);

      console.log('---------------------');

      console.log(npm.registry.adduser.toString());

      npm.registry.adduser(process.env.npmuser, process.env.npmpass, process.env.npmmail, function(err) {
        if (err) {
          grunt.log.error(err);
          grunt.file.write('package.json', JSON.stringify(pkg, true, 2));
          options.files.forEach(function (file, idx){
            grunt.file.write(file, fileContents[idx].old);
          });
          done(false);
        } else {
          npm.config.set('email', process.env.npmmail, 'user');
          npm.commands.publish([], function(err) {
            grunt.file.write('package.json', JSON.stringify(pkg, true, 2));
            options.files.forEach(function (file, idx){
              grunt.file.write(file, fileContents[idx].old);
            });
            grunt.log.ok('Published canary build to registry');
            done(!err);
          });
        }
      });
    });
  });


  // define runner tasks
  grunt.registerTask('lint', 'jshint');

  // split test & docs for speed
  grunt.registerTask('test', ['clean:coverage', 'prepareCoverage', 'concurrent:test', 'generateCoverageBadge']);
  grunt.registerTask('docs', ['clean:reportZip', 'clean:report', 'preparePlato', 'concurrent:docs', 'documantix', 'includereplace', 'compress']);

  // release tasks
  grunt.registerTask('releasePatch', ['test', 'bump-only:patch', 'contributors', 'changelog', 'bump-commit']);
  grunt.registerTask('releaseMinor', ['test', 'bump-only:minor', 'contributors', 'changelog', 'bump-commit']);
  grunt.registerTask('releaseMajor', ['test', 'bump-only:major', 'contributors', 'changelog', 'bump-commit']);

  // clean, test, generate docs (the CI task)
  grunt.registerTask('all', ['clean', 'test', 'docs']);
};
