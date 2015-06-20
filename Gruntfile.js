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
        eslint: {
            all: [
                'Gruntfile.js',
                'cli.js',
                'lib/**/*.js'
            ],
            options: {}
        },
        shell: {
            options: {
                stderr: false
            },
            shrinkwrap: {
                command: 'npm-shrinkwrap'
            },
            clientOutputToMarkdown: {
                command: docsCommand
            }
        },
        clean: {
            build: [
                'npm-shrinkwrap.json',
                '*chan'
            ]
        },
        watch: {
            eslint: {
                files: '<%= eslint.all %>',
                tasks: ['eslint']
            },
            simplemocha: {
                files: [
                    'test/**/*.js',
                    '<%= eslint.all %>'
                ],
                tasks: ['simplemocha']
            }
        },
        simplemocha: {
            options: { },
            all: { src: ['test/**/*.js'] }
        }
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-contrib-eslint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-simple-mocha');

    // Default task.
    grunt.registerTask('default', ['eslint']);
    grunt.registerTask('docs', ['shell:clientOutputToMarkdown']);
    grunt.registerTask('test', ['simplemocha']);
    grunt.registerTask('build', ['eslint', 'simplemocha', 'clean', 'docs', 'shell:shrinkwrap']);
    grunt.registerTask('dev', ['eslint', 'watch']);
};
