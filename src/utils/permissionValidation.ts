import { UserProfileWithDisplayData } from "@/types/auth";
import { AuditLogService } from "@/services/auditLogService";

export interface Permission {
  resource: string;
  action: 'read' | 'write' | 'delete' | 'admin';
  context?: Record<string, any>;
}

export class PermissionValidator {
  /**
   * Validate if user has required permission
   */
  static hasPermission(
    user: UserProfileWithDisplayData | null,
    permission: Permission
  ): boolean {
    if (!user) {return false;}

    // Log permission check
    AuditLogService.logDataAccess(
      `permission_check_${permission.action}`,
      permission.resource,
      undefined,
      {
        userId: user.id,
        permission,
        result: 'checking'
      }
    );

    // Basic permission logic - extend as needed
    const hasAccess = this.evaluatePermission(user, permission);

    // Log result
    AuditLogService.logDataAccess(
      `permission_${hasAccess ? 'granted' : 'denied'}`,
      permission.resource,
      undefined,
      {
        userId: user.id,
        permission,
        result: hasAccess ? 'granted' : 'denied'
      }
    );

    return hasAccess;
  }

  /**
   * Validate and throw if permission denied
   */
  static requirePermission(
    user: UserProfileWithDisplayData | null,
    permission: Permission
  ): void {
    if (!this.hasPermission(user, permission)) {
      // Log security violation
      AuditLogService.logSecurityViolation('unauthorized_access', {
        userId: user?.id,
        permission,
        timestamp: new Date().toISOString()
      });

      throw new Error(`Access denied: Missing ${permission.action} permission for ${permission.resource}`);
    }
  }

  /**
   * Check multiple permissions (all must pass)
   */
  static hasAllPermissions(
    user: UserProfileWithDisplayData | null,
    permissions: Permission[]
  ): boolean {
    return permissions.every(permission => this.hasPermission(user, permission));
  }

  /**
   * Check multiple permissions (at least one must pass)
   */
  static hasAnyPermission(
    user: UserProfileWithDisplayData | null,
    permissions: Permission[]
  ): boolean {
    return permissions.some(permission => this.hasPermission(user, permission));
  }

  /**
   * Core permission evaluation logic
   */
  private static evaluatePermission(
    user: UserProfileWithDisplayData,
    permission: Permission
  ): boolean {
    const { resource, action, context } = permission;

    // Admin users have all permissions
    if (this.isAdmin(user)) {
      return true;
    }

    // PRO users have extended permissions
    if (user.isPro) {
      switch (resource) {
        case 'calculations':
          return ['read', 'write', 'delete'].includes(action);
        case 'templates':
          return ['read', 'write'].includes(action);
        case 'analytics':
          return ['read'].includes(action);
        case 'automation':
          return ['read', 'write'].includes(action);
        default:
          return false;
      }
    }

    // Free users have basic permissions
    switch (resource) {
      case 'calculations':
        // Basic users can read/write their own calculations with limits
        if (action === 'read' || action === 'write') {
          return this.checkResourceOwnership(user, context);
        }
        return false;
      case 'templates':
        return action === 'read'; // Only read public templates
      case 'analytics':
        return false; // No analytics access for free users
      case 'automation':
        return false; // No automation access for free users
      default:
        return false;
    }
  }

  /**
   * Check if user is admin
   */
  private static isAdmin(user: UserProfileWithDisplayData): boolean {
    return user.email?.includes('@admin.') || 
           user.email === 'admin@precifica.com' ||
           user.email === 'support@precifica.com' ||
           user.email === 'zromulo.barbosa@icloud.com'; // Admin principal
  }

  /**
   * Check resource ownership
   */
  private static checkResourceOwnership(
    user: UserProfileWithDisplayData,
    context?: Record<string, any>
  ): boolean {
    if (!context || !context.userId) {return true;} // No ownership context provided
    return context.userId === user.id;
  }

  /**
   * Get user's available permissions
   */
  static getUserPermissions(user: UserProfileWithDisplayData | null): Permission[] {
    if (!user) {return [];}

    const permissions: Permission[] = [];

    if (this.isAdmin(user)) {
      // Admin has all permissions
      const resources = ['calculations', 'templates', 'analytics', 'automation', 'users', 'system'];
      const actions: Permission['action'][] = ['read', 'write', 'delete', 'admin'];
      
      resources.forEach(resource => {
        actions.forEach(action => {
          permissions.push({ resource, action });
        });
      });
    } else if (user.isPro) {
      // PRO user permissions
      permissions.push(
        { resource: 'calculations', action: 'read' },
        { resource: 'calculations', action: 'write' },
        { resource: 'calculations', action: 'delete' },
        { resource: 'templates', action: 'read' },
        { resource: 'templates', action: 'write' },
        { resource: 'analytics', action: 'read' },
        { resource: 'automation', action: 'read' },
        { resource: 'automation', action: 'write' }
      );
    } else {
      // Free user permissions
      permissions.push(
        { resource: 'calculations', action: 'read' },
        { resource: 'calculations', action: 'write' },
        { resource: 'templates', action: 'read' }
      );
    }

    return permissions;
  }
}