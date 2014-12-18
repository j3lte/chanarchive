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
            build: [
                "npm-shrinkwrap.json",
                "*chan"
            ]
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
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Default task.
    grunt.registerTask('default',   ['jshint']);
    grunt.registerTask('docs',      ['shell:cli_to_md']);
    grunt.registerTask('build',     ['jshint', 'clean', 'docs', 'shell:shrinkwrap']);
    grunt.registerTask('dev',       ['jshint', 'watch']);
};
