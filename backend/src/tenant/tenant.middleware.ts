import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantContextService } from './tenant-context.service';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly tenantContextService: TenantContextService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    let clinicId: string | undefined;
    let isSuperAdmin = false;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const [, payload] = token.split('.');
        if (payload) {
          const decoded = JSON.parse(
            Buffer.from(payload, 'base64').toString('utf8'),
          );
          
          // Suporta token de Admin/Staff (clinicId) e token de Tutor (allowedClinicIds)
          clinicId = decoded.clinicId;
          isSuperAdmin = decoded.role === 'SUPERADMIN';
          
          // Se for tutor, podemos pegar a primeira clínica permitida se clinicId não estiver presente
          if (!clinicId && decoded.allowedClinicIds && decoded.allowedClinicIds.length > 0) {
            clinicId = decoded.allowedClinicIds[0];
          }
        }
      } catch (err) {
        // Ignora erros de parsing
      }
    }

    this.tenantContextService.run({ clinicId, isSuperAdmin }, () => {
      next();
    });
  }
}
