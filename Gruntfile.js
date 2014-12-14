/*
 * chanarchive
 * https://github.com/j3lte/chanarchive
 *
 * Copyright (c) 2014 Jelte Lagendijk
 * Licensed under the MIT license.
 */
'use strict';

var docsCommand = [
    'echo "## Output chanarchive\n" > ./docs/cli.md; ',
    'echo "\\\`\\\`\\\`" >> ./docs/cli.md; ',
    'node ./cli.js >> ./docs/cli.md; ',
    'echo "\\\`\\\`\\\`" >> ./docs/cli.md;'].join('');

module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            all: [
                "Gruntfile.js",
                "src/**/*.js",
            ],
            options: {
                jshintrc : '.jshintrc',
                reporter: require('jshint-stylish'),
                force: false
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                        '<%= grunt.template.today("yyyy-mm-dd") %> */',
                mangle: {toplevel: true},
                squeeze: {dead_code: false},
                codegen: {quote_keys: true}
            },
            build: {
                files: [{
                    expand: true,
                    cwd: 'src/',
                    src: '**/*.js',
                    dest: ''
                }]
            }
        },
        shell: {
            options: {
                stderr: false
            },
            shrinkwrap : {
                command: 'npm-shrinkwrap'
            },
            cli_to_md: {
                command: docsCommand
            }
        },
        clean: {
            build: ["npm-shrinkwrap.json"]
        },
        watch : {
            jshint : {
                files : '<%= jshint.all %>',
                tasks: ['jshint']
            },
            uglify : {
                files : '<%= jshint.all %>',
                tasks : ['uglify']
            }
        }
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Default task.
    grunt.registerTask('default',   ['jshint']);
    grunt.registerTask('docs',      ['shell:cli_to_md']);
    grunt.registerTask('build',     ['jshint', 'uglify', 'clean', 'docs', 'shell:shrinkwrap']);
    grunt.registerTask('dev',       ['jshint', 'watch']);
};
