// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { PermissionLevelString } from '../../../../types';

export type PermissionLevel = Exclude<PermissionLevelString, PermissionLevelString.Admin>;
