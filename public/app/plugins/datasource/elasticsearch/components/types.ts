// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
export type SettingKeyOf<T extends { settings?: Record<string, unknown> }> = Extract<
  keyof NonNullable<T['settings']>,
  string
>;
