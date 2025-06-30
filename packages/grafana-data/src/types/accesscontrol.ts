// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { KeyValue } from '.';

/**
 * With FGAC, the backend will return additional access control metadata to objects.
 * These metadata will contain user permissions associated to a given resource.
 *
 * For example:
 * {
 *   accessControl: { "datasources:read": true, "datasources:write": true }
 * }
 */
export interface WithAccessControlMetadata {
  accessControl?: KeyValue<boolean>;
}
