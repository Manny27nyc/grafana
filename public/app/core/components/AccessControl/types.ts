// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
export type ResourcePermission = {
  id: number;
  resourceId: string;
  isManaged: boolean;
  userId?: number;
  userLogin?: string;
  userAvatarUrl?: string;
  team?: string;
  teamId?: number;
  teamAvatarUrl?: string;
  builtInRole?: string;
  actions: string[];
  permission: string;
};

export type SetPermission = {
  userId?: number;
  teamId?: number;
  builtInRole?: string;
  permission: string;
  target: PermissionTarget;
};

export enum PermissionTarget {
  Team = 'Team',
  User = 'User',
  BuiltInRole = 'builtInRole',
}
export type Description = {
  assignments: Assignments;
  permissions: string[];
};

export type Assignments = {
  users: boolean;
  teams: boolean;
  builtInRoles: boolean;
};
