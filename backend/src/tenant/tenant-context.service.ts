import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

export interface TenantStore {
  clinicId?: string;
  isSuperAdmin?: boolean;
}

@Injectable()
export class TenantContextService {
  private readonly storage = new AsyncLocalStorage<TenantStore>();

  run(store: TenantStore, callback: () => void) {
    return this.storage.run(store, callback);
  }

  getStore(): TenantStore | undefined {
    return this.storage.getStore();
  }

  getClinicId(): string | undefined {
    return this.getStore()?.clinicId;
  }

  isSuperAdmin(): boolean {
    return !!this.getStore()?.isSuperAdmin;
  }
}
