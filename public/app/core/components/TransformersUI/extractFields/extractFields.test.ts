// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { toDataFrame } from '@grafana/data/src/dataframe/processDataFrame';
import { ExtractFieldsOptions, extractFieldsTransformer } from './extractFields';

describe('Fields from JSON', () => {
  it('adds fields from JSON in string', async () => {
    const cfg: ExtractFieldsOptions = {
      source: 'line',
      replace: true,
    };
    const data = toDataFrame({
      columns: ['ts', 'line'],
      rows: appl,
    });

    const frames = extractFieldsTransformer.transformer(cfg)([data]);
    expect(frames.length).toEqual(1);
    expect(
      frames[0].fields.reduce((acc, v) => {
        acc[v.name] = v.type;
        return acc;
      }, {} as any)
    ).toMatchInlineSnapshot(`
      Object {
        "a": "string",
        "av": "number",
        "c": "string",
        "e": "number",
        "ev": "string",
        "h": "string",
        "l": "string",
        "o": "string",
        "op": "string",
        "s": "number",
        "sym": "string",
        "v": "number",
        "vw": "string",
        "z": "number",
      }
    `);
  });
});

const appl = [
  [
    '1636678740000000000',
    '{"a":"148.1673","av":41941752,"c":"148.25","e":1636678800000,"ev":"AM","h":"148.28","l":"148.22","o":"148.25","op":"148.96","s":1636678740000,"sym":"AAPL","v":2903,"vw":"148.2545","z":152}',
  ],
  [
    '1636678680000000000',
    '{"a":"148.1673","av":41938849,"c":"148.25","e":1636678740000,"ev":"AM","h":"148.27","l":"148.25","o":"148.26","op":"148.96","s":1636678680000,"sym":"AAPL","v":7589,"vw":"148.2515","z":329}',
  ],
  [
    '1636678620000000000',
    '{"a":"148.1672","av":41931260,"c":"148.27","e":1636678680000,"ev":"AM","h":"148.27","l":"148.25","o":"148.27","op":"148.96","s":1636678620000,"sym":"AAPL","v":6138,"vw":"148.2541","z":245}',
  ],
  [
    '1636678560000000000',
    '{"a":"148.1672","av":41925122,"c":"148.28","e":1636678620000,"ev":"AM","h":"148.29","l":"148.27","o":"148.27","op":"148.96","s":1636678560000,"sym":"AAPL","v":1367,"vw":"148.2816","z":56}',
  ],
  [
    '1636678500000000000',
    '{"a":"148.1672","av":41923755,"c":"148.25","e":1636678560000,"ev":"AM","h":"148.27","l":"148.25","o":"148.25","op":"148.96","s":1636678500000,"sym":"AAPL","v":556,"vw":"148.2539","z":55}',
  ],
  [
    '1636678440000000000',
    '{"a":"148.1672","av":41923199,"c":"148.28","e":1636678500000,"ev":"AM","h":"148.28","l":"148.25","o":"148.25","op":"148.96","s":1636678440000,"sym":"AAPL","v":451,"vw":"148.2614","z":56}',
  ],
  [
    '1636678380000000000',
    '{"a":"148.1672","av":41922748,"c":"148.24","e":1636678440000,"ev":"AM","h":"148.24","l":"148.24","o":"148.24","op":"148.96","s":1636678380000,"sym":"AAPL","v":344,"vw":"148.2521","z":24}',
  ],
  [
    '1636678320000000000',
    '{"a":"148.1672","av":41922404,"c":"148.28","e":1636678380000,"ev":"AM","h":"148.28","l":"148.24","o":"148.24","op":"148.96","s":1636678320000,"sym":"AAPL","v":705,"vw":"148.2543","z":64}',
  ],
  [
    '1636678260000000000',
    '{"a":"148.1672","av":41921699,"c":"148.25","e":1636678320000,"ev":"AM","h":"148.25","l":"148.25","o":"148.25","op":"148.96","s":1636678260000,"sym":"AAPL","v":1054,"vw":"148.2513","z":131}',
  ],
];
