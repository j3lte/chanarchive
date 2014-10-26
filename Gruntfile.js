/*
 * node-rdw
 * https://github.com/j3lte/node-rdw
 *
 * Copyright (c) 2014 Jelte Lagendijk
 * Licensed under the MIT license.
 */
'use strict';
module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            all: [
                "Gruntfile.js",
                "index.js",
                "proxy/*.js",
                "bin/*.js",
                "lib/*.js"
            ],
            options: {
                jshintrc : '.jshintrc',
                reporter: require('jshint-stylish'),
                force: false
            }
        },
        watch : {
            jshint : {
                files : '<%= jshint.all %>',
                tasks: ['jshint']
            }
        }
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Default task.
    grunt.registerTask('default', ['jshint']);
    grunt.registerTask('dev', ['jshint', 'watch']);
};
