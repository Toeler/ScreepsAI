module.exports = function(grunt) {
	var screepsCreds = require('./screeps.json');
    grunt.initConfig({
		clean: [
			'dist/'
		],
		copy: {
			main: {
				expand: true,
				cwd: 'src/',
				src: '**',
				dest: 'dist/',
				flatten: true,
    			filter: 'isFile',
				options: {
					process: function (content, srcpath) {
						return content.replace(/(require\(['`]).*\/(.*)(['`]\))/g, '$1$2$3');
					},
				},
			},
		},
        screeps: {
			options: {
                email: screepsCreds.email,
                password: screepsCreds.password,
                branch: 'default',
                ptr: false
            },
            dist: {
                src: ['dist/*.js']
            }
        }
    });

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-screeps');

	grunt.registerTask('build', ['clean', 'copy']);
	grunt.registerTask('deploy', ['build', 'screeps']);
}