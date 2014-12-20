module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-concat');

  grunt.initConfig({
    browserify: {
      app: {
        src: ['app/app.js'],
        dest: 'build/app.js',
        options: {
          transform: ['reactify']
        }
      }
    },
    copy: {
      html: {
        files: {
          "build/index.html" : "app/index.html",
          "build/main.css" : "app/main.css",
          "build/octicons.css" : "bower_components/octicons/octicons/octicons.css",
          "build/octicons.eot" : "bower_components/octicons/octicons/octicons.eot",
          "build/octicons.woff" : "bower_components/octicons/octicons/octicons.woff",
          "build/octicons.ttf" : "bower_components/octicons/octicons/octicons.ttf",
          "build/octicons.svg" : "bower_components/octicons/octicons/octicons.svg",
        }
      }
    },
    concat: {
      vendor: {
        src: ['bower_components/underscore/underscore.js', 'bower_components/jquery/dist/jquery.js'],
        dest: 'build/vendor.js',
      }
    }
  });

  grunt.registerTask("default", ["browserify", "copy", "concat"])
}
