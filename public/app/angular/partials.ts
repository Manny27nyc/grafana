// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
let templates = (require as any).context('../', true, /\.html$/);
templates.keys().forEach((key: string) => {
  templates(key);
});
