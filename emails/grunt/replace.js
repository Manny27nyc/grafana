// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
module.exports = {
  dist: {
    overwrite: true,
    src: ['dist/*.html', 'dist/*.txt'],
    replacements: [
      {
        from: '[[',
        to: '{{',
      },
      {
        from: ']]',
        to: '}}',
      },
    ],
  },
};
