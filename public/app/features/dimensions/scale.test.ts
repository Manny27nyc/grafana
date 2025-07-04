// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { ArrayVector, DataFrame, FieldType } from '@grafana/data';
import { getScaledDimension, validateScaleConfig } from './scale';

describe('scale dimensions', () => {
  it('should validate empty input', () => {
    const out = validateScaleConfig({} as any, {
      min: 5,
      max: 10,
    });
    expect(out).toMatchInlineSnapshot(`
      Object {
        "fixed": 7.5,
        "max": 10,
        "min": 5,
      }
    `);
  });

  it('should assert min<max', () => {
    const out = validateScaleConfig(
      {
        max: -3,
        min: 7,
        fixed: 100,
      },
      {
        min: 5,
        max: 10,
      }
    );
    expect(out).toMatchInlineSnapshot(`
      Object {
        "fixed": 10,
        "max": 7,
        "min": 5,
      }
    `);
  });

  it('should support negative min values', () => {
    const values = [-20, -10, -5, 0, 5, 10, 20];
    const frame: DataFrame = {
      name: 'a',
      length: values.length,
      fields: [
        { name: 'time', type: FieldType.number, values: new ArrayVector(values), config: {} },
        {
          name: 'hello',
          type: FieldType.number,
          values: new ArrayVector(values),
          config: {
            min: -10,
            max: 10,
          },
        },
      ],
    };

    const supplier = getScaledDimension(frame, {
      min: -1,
      max: 1,
      field: 'hello',
      fixed: 0,
    });
    const scaled = frame.fields[0].values.toArray().map((k, i) => supplier.get(i));
    expect(scaled).toEqual([-1, -1, -0.5, 0, 0.5, 1, 1]);
  });
});
