// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
export default {
  id: 'cloudwatch-sql',
  extensions: ['.cloudwatchSql'],
  aliases: ['CloudWatch', 'cloudwatch', 'CloudWatchSQL'],
  mimetypes: [],
  loader: () => import('./language'),
};
