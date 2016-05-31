module.exports = function(grunt) {
  "use strict";

  grunt.initConfig({
    pkg: require("./package.json"),
    watch: {
      scripts: {
        files: ['*.js', 'src/*.js', 'test/*.html', 'test/*.js'],
        tasks: ['test'],
        options: {
          spawn: false,
        },
      },
    },
    shell: {
      install: {
        command: 'echo',
        options: {
          stderr: true
        }
      },
      build: {
        command: 'node node_modules/browserify/bin/cmd.js index.js > dist/list.style.js',
        options: {
          stderr: true
        }
      },
      remove: {
        command: 'rm -fr node_modules dist'
      }
    },
    jshint: {
      code: {
        src: ['Gruntfile.js', '*.js', 'src/*.js'],
        options: {
          expr: true,
          multistr: false,
          globals: {
            module: true
          }
        }
      },
      tests: {
        src: ['test/(*|!mocha).js'],
        options: {
          expr: true,
          multistr: true,
          globals: {
            jQuery: true,
            module: true
          }
        }
      }
    },
    uglify: {
      target: {
        files: {
          'dist/list.style.min.js': ['dist/list.style.js']
        }
      }
    },
    mocha: {
      cool: {
        src: [ 'test/index.html' ],
        options: {
          run: true,
          timeout: 10000,
          bail: false,
          log: true,
          reporter: 'Nyan',
          mocha: {
            ignoreLeaks: false
          }
        }
      }
    }
  });

  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-mocha');

  grunt.registerTask('default', ['jshint:code', 'jshint:tests', 'shell:install', 'shell:build', 'mocha']);
  grunt.registerTask('dist', ['default', 'shell:standalone', 'shell:mkdir', 'shell:move', 'uglify']);
  grunt.registerTask('clean', ['shell:remove']);
  grunt.registerTask('test', ['mocha']);

  return grunt;
};
