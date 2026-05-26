import { Injectable } from '@nestjs/common';

type TemplatePayload = Record<
  string,
  string | number | boolean | Date | null | undefined
>;

@Injectable()
export class TemplateService {
  compile(template: string, payload: TemplatePayload): string {
    return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_match, key) => {
      const value = payload[key];

      if (value === null || value === undefined) {
        return '';
      }

      if (value instanceof Date) {
        return value.toISOString();
      }

      return String(value);
    });
  }
}
