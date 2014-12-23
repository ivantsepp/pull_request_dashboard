module.exports = function(grunt) {
  grunt.loadNpmTasks("grunt-browserify");
  grunt.loadNpmTasks("grunt-contrib-copy");
  grunt.loadNpmTasks("grunt-contrib-concat");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-contrib-sass");

  grunt.initConfig({
    env: grunt.option("env") || process.env.ENV || "development",
    files: {
      html: {
        src: "app/index.html"
      },
      sass: {
        src: ["app/css/main.scss"]
      },
      js: {
        vendor: [
          "bower_components/underscore/underscore.js",
          "bower_components/jquery/dist/jquery.js"
        ],
        app: [
          "app/js/app.js"
        ]
      },
      octicons: {
        "build/css/octicons.css" : "bower_components/octicons/octicons/octicons.css",
        "build/css/octicons.eot" : "bower_components/octicons/octicons/octicons.eot",
        "build/css/octicons.woff" : "bower_components/octicons/octicons/octicons.woff",
        "build/css/octicons.ttf" : "bower_components/octicons/octicons/octicons.ttf",
        "build/css/octicons.svg" : "bower_components/octicons/octicons/octicons.svg"
      }
    },

    browserify: {
      app: {
        src: ["<%= files.js.app %>"],
        dest: "build/js/app.js",
        options: {
          transform: ["reactify"],
          banner: "var ENV = '<%= env %>';"
        }
      }
    },
    sass: {
      development: {
        options: {
          style: 'expanded',
          lineNumbers: true
        },
        src: ["<%= files.sass.src %>"],
        dest: "build/css/main.css"
      },
      production: {
        options: {
          style: 'compressed'
        },
        src: ["<%= files.sass.src %>"],
        dest: "build/css/main.css"
      }
    },
    copy: {
      html: {
        files: {
          "build/index.html" : "<%= files.html.src %>",
          "build/favicon.ico" : "app/favicon.ico",
        }
      },
      octicons: {
        files: "<%= files.octicons %>"
      }
    },
    concat: {
      vendor: {
        src: ["<%= files.js.vendor %>"],
        dest: "build/js/vendor.js",
      }
    },
    watch: {
      html: {
        files: ["<%= files.html.src %>"],
        tasks: ["copy:html"]
      },
      js: {
        files: ["app/js/**/*"],
        tasks: ["browserify"]
      },
      sass: {
        files: ["app/css/**/*"],
        tasks: ["sass:development"]
      }
    }
  });

  grunt.registerTask("default", ["build:"+grunt.config.get("env")]);
  grunt.registerTask("build", function(env){
    if (env === "development"){
      grunt.task.run(["browserify", "sass:development", "copy", "concat"]);
    } else if (env === "production"){
      grunt.task.run(["browserify", "sass:production", "copy", "concat"]);
    }
  });
}
