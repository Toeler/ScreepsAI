module.exports = function(grunt) {
	var screepsCreds = require('./screeps.json');
    grunt.initConfig({
		copy: {
			main: {
				expand: true,
				cwd: 'src',
				src: '**',
				dest: 'dist/',
			},
		},
        screeps: {
			options: {
                email: screepsCreds.email,
                password: screepsCreds.password,
                branch: 'proto',
                ptr: false
            },
            dist: {
                src: ['dist/*.js']
            }
        }
    });

	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-screeps');

	grunt.registerTask('build', ['copy']);
	grunt.registerTask('deploy', ['build', 'screeps']);
}