import { TemplateService } from './template.service';

describe('TemplateService', () => {
  it('replaces placeholders with payload values', () => {
    const service = new TemplateService();

    expect(
      service.compile(
        'Ola {{ client_name }}, {{pet_name}} tem consulta em {{appointment_time}} na {{clinic_name}}.',
        {
          client_name: 'Ana',
          pet_name: 'Luna',
          appointment_time: '14:00',
          clinic_name: 'VetOS',
        },
      ),
    ).toBe('Ola Ana, Luna tem consulta em 14:00 na VetOS.');
  });
});
