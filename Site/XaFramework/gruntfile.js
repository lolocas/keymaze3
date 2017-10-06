module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('../package.json'),
    copy: {
      files: [
        {expand: true, src: ['dist/js/*'], dest: '../xademo/lib/*', filter: 'isFile'},
        {expand: true, src: ['dist/css/*'], dest: '../xademo/lib/*', filter: 'isFile'}
      ]
    },
     watch: {
      files: ['dist/js/*', 'dist/css/*'],
      tasks: ['copy']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-watch');
  
  grunt.registerTask('default', ['watch']);

};