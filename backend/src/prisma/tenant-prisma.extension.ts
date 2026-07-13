import { Prisma } from '@prisma/client';
import { TenantContextService } from '../tenant/tenant-context.service';
import { Logger } from '@nestjs/common';

const logger = new Logger('TenantPrismaExtension');

// Lista extraída diretamente do schema.prisma
export const MODELS_WITH_CLINIC_ID = [
  'User',
  'Client',
  'Pet',
  'Appointment',
  'ClinicSubscription',
  'WeightRecord',
  'Allergy',
  'VaccineRecord',
  'VaccineProtocol',
  'ClinicalRecord',
  'NotificationConfig',
  'NotificationTemplate',
  'NotificationLog',
  'ClinicalAttachment',
  'Prescription',
  'ConsentTemplate',
  'ConsentTerm',
];

export const MODELS_WITHOUT_CLINIC_ID = [
  'Clinic',
  'ImpersonationLog',
  'Plan',
  'VaccineProtocolDose',
  'TutorIdentity',
  'TutorPortalToken',
  'TutorSession',
];

export interface DecisionResult {
  shouldFilter: boolean;
  reason: string;
}

export function evaluateDecision(
  model: string,
  operation: string,
  clinicId?: string,
  isSuperAdmin?: boolean,
): DecisionResult {
  if (!MODELS_WITH_CLINIC_ID.includes(model)) {
    return {
      shouldFilter: false,
      reason: `Model '${model}' does not contain clinicId field.`,
    };
  }

  if (isSuperAdmin) {
    return {
      shouldFilter: false,
      reason: 'Super Admin context bypasses tenant isolation.',
    };
  }

  if (!clinicId) {
    return {
      shouldFilter: false,
      reason: 'No clinicId present in TenantContext (public or global route).',
    };
  }

  return {
    shouldFilter: true,
    reason: `Tenant isolation active for clinicId '${clinicId}'.`,
  };
}

export type TenantExtensionMode = 'OFF' | 'LOG' | 'FILTER_READ' | 'FILTER_WRITE' | 'FULL';

// Helper functions for safe type narrowing of generic Prisma arguments
function hasWhere<T>(args: T): args is T & { where: Record<string, any> } {
  return args !== null && typeof args === 'object' && 'where' in args;
}

function hasData<T>(args: T): args is T & { data: any } {
  return args !== null && typeof args === 'object' && 'data' in args;
}

function hasCreate<T>(args: T): args is T & { create: any } {
  return args !== null && typeof args === 'object' && 'create' in args;
}

export function getTenantExtension(tenantContext: TenantContextService) {
  return Prisma.defineExtension({
    name: 'tenant-isolation',
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const mode = (process.env.TENANT_EXTENSION_MODE || 'OFF') as TenantExtensionMode;

          if (mode === 'OFF') {
            return query(args);
          }

          const clinicId = tenantContext.getClinicId();
          const isSuperAdmin = tenantContext.isSuperAdmin();
          const decision = evaluateDecision(model, operation, clinicId, isSuperAdmin);

          const READ_OPERATIONS = ['findFirst', 'findMany', 'findUnique', 'count', 'groupBy'];
          const WRITE_OPERATIONS = ['create', 'createMany', 'update', 'updateMany', 'delete', 'deleteMany', 'upsert'];

          const isRead = READ_OPERATIONS.includes(operation);
          const isWrite = WRITE_OPERATIONS.includes(operation);

          const shouldApplyFilter =
            decision.shouldFilter &&
            (mode === 'FULL' ||
              (mode === 'FILTER_READ' && isRead) ||
              (mode === 'FILTER_WRITE' && isWrite));

          let finalArgs = args;

          if (shouldApplyFilter && clinicId) {
            finalArgs = { ...args };
            const ctx = Prisma.getExtensionContext(this);

            if (operation === 'create') {
              if (hasData(finalArgs)) {
                finalArgs.data = { ...finalArgs.data, clinicId };
              }
            } else if (operation === 'createMany') {
              if (hasData(finalArgs)) {
                if (Array.isArray(finalArgs.data)) {
                  finalArgs.data = finalArgs.data.map((item: any) => ({ ...item, clinicId }));
                } else if (finalArgs.data) {
                  finalArgs.data = { ...finalArgs.data, clinicId };
                }
              }
            } else if (operation === 'findUnique') {
              if (hasWhere(finalArgs)) {
                finalArgs.where = { ...finalArgs.where, clinicId };
              }
              if (process.env.NODE_ENV !== 'production') {
                logger.debug(
                  `[TenantPrismaExtension] Redirected findUnique to findFirst for model ${model} to enforce clinicId filter.`,
                );
              }
              return (ctx as any).findFirst(finalArgs);
            } else if (operation === 'update' || operation === 'delete') {
              if (hasWhere(finalArgs)) {
                const record = await (ctx as any).findFirst({
                  where: { ...finalArgs.where, clinicId },
                  select: { id: true },
                });
                if (!record) {
                  throw new Error(`Record not found or access denied for tenant '${clinicId}' on model '${model}'.`);
                }
              }
            } else if (operation === 'upsert') {
              if (hasWhere(finalArgs)) {
                const existsGlobally = await (ctx as any).findFirst({
                  where: finalArgs.where,
                  select: { id: true },
                });
                if (existsGlobally) {
                  const belongsToTenant = await (ctx as any).findFirst({
                    where: { ...finalArgs.where, clinicId },
                    select: { id: true },
                  });
                  if (!belongsToTenant) {
                    throw new Error(`Record access denied for tenant '${clinicId}' on model '${model}'.`);
                  }
                }
              }
              if (hasCreate(finalArgs)) {
                finalArgs.create = { ...finalArgs.create, clinicId };
              }
            } else {
              if (hasWhere(finalArgs)) {
                finalArgs.where = { ...finalArgs.where, clinicId };
              }
            }

            if (process.env.NODE_ENV !== 'production') {
              logger.debug(
                `[TenantPrismaExtension] Enforced clinicId '${clinicId}' in ${model}.${operation} query arguments.`,
              );
            }
          }

          if (process.env.NODE_ENV !== 'production' || mode === 'LOG') {
            logger.debug(
              `[Prisma Query Audit] Model: ${model} | Operation: ${operation} | TenantId: ${
                clinicId || 'None'
              } | Decision: ${decision.shouldFilter ? 'FILTERED' : 'BYPASSED'} | Applied: ${shouldApplyFilter} | Reason: ${decision.reason}`,
            );
          }

          return query(finalArgs);
        },
      },
    },
  });
}
