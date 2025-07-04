// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { getGazetteer } from './gazetteer';

let backendResults: any = { hello: 'world' };

const geojsonObject = {
  type: 'FeatureCollection',
  features: [
    {
      id: 'A',
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [0, 0],
      },
      properties: {
        hello: 'A',
      },
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [1, 1],
      },
      properties: {
        some_code: 'B',
        hello: 'B',
      },
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [2, 2],
      },
      properties: {
        an_id: 'C',
        hello: 'C',
      },
    },
  ],
};

jest.mock('@grafana/runtime', () => ({
  ...((jest.requireActual('@grafana/runtime') as unknown) as object),
  getBackendSrv: () => ({
    get: jest.fn().mockResolvedValue(backendResults),
  }),
}));

describe('Placename lookup from geojson format', () => {
  beforeEach(() => {
    backendResults = { hello: 'world' };
  });

  it('can lookup by id', async () => {
    backendResults = geojsonObject;
    const gaz = await getGazetteer('local');
    expect(gaz.error).toBeUndefined();
    expect(gaz.find('A')?.point()?.getCoordinates()).toMatchInlineSnapshot(`
      Array [
        0,
        0,
      ]
    `);
  });
  it('can look up by a code', async () => {
    backendResults = geojsonObject;
    const gaz = await getGazetteer('airports');
    expect(gaz.error).toBeUndefined();
    expect(gaz.find('B')?.point()?.getCoordinates()).toMatchInlineSnapshot(`
      Array [
        1,
        1,
      ]
    `);
  });

  it('can look up by an id property', async () => {
    backendResults = geojsonObject;
    const gaz = await getGazetteer('airports');
    expect(gaz.error).toBeUndefined();
    expect(gaz.find('C')?.point()?.getCoordinates()).toMatchInlineSnapshot(`
      Array [
        2,
        2,
      ]
    `);
  });
});
