// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { getGazetteer } from './gazetteer';

let backendResults: any = { hello: 'world' };
import countriesJSON from '../../../../gazetteer/countries.json';
import { toLonLat } from 'ol/proj';

jest.mock('@grafana/runtime', () => ({
  ...((jest.requireActual('@grafana/runtime') as unknown) as object),
  getBackendSrv: () => ({
    get: jest.fn().mockResolvedValue(backendResults),
  }),
}));

describe('Placename lookup from worldmap format', () => {
  beforeEach(() => {
    backendResults = { hello: 'world' };
  });

  it('unified worldmap config', async () => {
    backendResults = countriesJSON;
    const gaz = await getGazetteer('countries');
    expect(gaz.error).toBeUndefined();
    expect(toLonLat(gaz.find('US')?.point()?.getCoordinates()!)).toMatchInlineSnapshot(`
      Array [
        -95.712891,
        37.09023999999998,
      ]
    `);
    // Items with 'keys' should get allow looking them up
    expect(gaz.find('US')).toEqual(gaz.find('USA'));
  });
});
