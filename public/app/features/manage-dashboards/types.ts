// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
export interface Snapshot {
  created: string;
  expires: string;
  external: boolean;
  externalUrl: string;
  id: number;
  key: string;
  name: string;
  orgId: number;
  updated: string;
  url?: string;
  userId: number;
}
