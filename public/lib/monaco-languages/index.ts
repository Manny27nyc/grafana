// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import loadKusto from './kusto';

export default function getDefaultMonacoLanguages() {
  const kusto = { id: 'kusto', name: 'kusto', init: loadKusto };
  return [kusto];
}
