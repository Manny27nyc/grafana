// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
module.exports = {
  dist: {
    src: ['dist/*.html'],
    dest: 'dist/css/tidy.css',
    options: {
      report: 'min', // optional: include to report savings
    },
  },
};
