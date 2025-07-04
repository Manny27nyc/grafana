// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
interface LdapMapping {
  cfgAttrValue: string;
  ldapValue: string;
}

export interface LdapError {
  title: string;
  body: string;
}

export interface SyncInfo {
  enabled: boolean;
  schedule: string;
  nextSync: string;
}

export interface LdapUserSyncInfo {
  nextSync?: string;
  prevSync?: string;
  status?: string;
}

export interface FailedUser {
  Login: string;
  Error: string;
}

export interface LdapRole {
  orgId: number;
  orgName: string;
  orgRole: string;
  groupDN: string;
}

export interface LdapTeam {
  orgName: string;
  teamName: string;
  groupDN: string;
}

export interface LdapUserInfo {
  name: LdapMapping;
  surname: LdapMapping;
  email: LdapMapping;
  login: LdapMapping;
}

export interface LdapPermissions {
  isGrafanaAdmin: boolean;
  isDisabled: boolean;
}

export interface LdapUser {
  info: LdapUserInfo;
  permissions: LdapPermissions;
  roles: LdapRole[];
  teams: LdapTeam[];
}

export interface LdapServerInfo {
  available: boolean;
  host: string;
  port: number;
  error: string;
}

export type LdapConnectionInfo = LdapServerInfo[];

export interface LdapState {
  connectionInfo: LdapConnectionInfo;
  user?: LdapUser;
  syncInfo?: SyncInfo;
  connectionError?: LdapError;
  userError?: LdapError;
  ldapError?: LdapError;
}
