import { PrismaClient, Role, AppointmentStatus, ClinicalRecordType, DocumentStatus, NotificationChannel, NotificationStatus, VaccineStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

function assertLocalSeedAllowed() {
  const env = process.env.NODE_ENV;
  const databaseUrl = process.env.DATABASE_URL ?? '';

  if (env === 'production' || env === 'staging') {
    throw new Error('Seed demo bloqueado fora de ambiente local.');
  }

  const isLocal =
    databaseUrl.includes('localhost') ||
    databaseUrl.includes('127.0.0.1') ||
    databaseUrl.includes('postgres:5432');

  if (!isLocal) {
    throw new Error('Seed demo bloqueado: DATABASE_URL não parece local.');
  }
}

function getMaskedDatabaseUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.password) {
      parsed.password = '******';
    }
    return parsed.toString();
  } catch {
    return url.replace(/(:\/\/[^:]+:)[^@]+(@)/, '$1******$2');
  }
}

async function main() {
  assertLocalSeedAllowed();
  
  const maskedUrl = getMaskedDatabaseUrl(process.env.DATABASE_URL ?? '');
  console.log(`📡 Usando banco de dados: ${maskedUrl}`);
  console.log('⚠️ AVISO: O seed irá LIMPAR e RECRIAR todos os dados demo locais!');
  console.log('🌱 Starting database seeding...');

  // 1. Safe Cleanup in reverse dependency order
  console.log('🧹 Cleaning up database tables...');
  await prisma.impersonationLog.deleteMany({});
  await prisma.clinicalAttachment.deleteMany({});
  await prisma.prescription.deleteMany({});
  await prisma.consentTerm.deleteMany({});
  await prisma.consentTemplate.deleteMany({});
  await prisma.notificationLog.deleteMany({});
  await prisma.notificationTemplate.deleteMany({});
  await prisma.notificationConfig.deleteMany({});
  await prisma.vaccineRecord.deleteMany({});
  await prisma.vaccineProtocolDose.deleteMany({});
  await prisma.vaccineProtocol.deleteMany({});
  await prisma.allergy.deleteMany({});
  await prisma.weightRecord.deleteMany({});
  await prisma.appointment.deleteMany({});
  await prisma.pet.deleteMany({});
  await prisma.client.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.clinicSubscription.deleteMany({});
  await prisma.plan.deleteMany({});
  await prisma.clinic.deleteMany({});
  console.log('🧹 Cleanup complete.');

  // 2. Create Plans (SaaS tiers)
  console.log('📦 Creating SaaS plans...');
  const planStarter = await prisma.plan.create({
    data: {
      name: 'Starter',
      maxStaffSeats: 3,
      maxNotifications: 150,
      maxStorage: 1024, // 1GB in MB
      features: JSON.stringify(['email_notifications', 'calendar']),
    },
  });

  const planProfessional = await prisma.plan.create({
    data: {
      name: 'Professional',
      maxStaffSeats: 10,
      maxNotifications: 1000,
      maxStorage: 10240, // 10GB in MB
      features: JSON.stringify(['email_notifications', 'whatsapp_notifications', 'calendar', 'analytics', 'signatures']),
    },
  });

  const planEnterprise = await prisma.plan.create({
    data: {
      name: 'Enterprise',
      maxStaffSeats: 999,
      maxNotifications: 99999,
      maxStorage: 102400, // 100GB in MB
      features: JSON.stringify(['email_notifications', 'whatsapp_notifications', 'calendar', 'analytics', 'signatures', 'ai_copilot']),
    },
  });

  // 3. Create Demo Clinics
  console.log('🏥 Creating demo clinics...');
  const clinicAlfa = await prisma.clinic.create({
    data: {
      name: 'Clínica Veterinária Alfa',
      address: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
      phone: '(11) 3214-5555',
    },
  });

  const clinicBeta = await prisma.clinic.create({
    data: {
      name: 'Hospital Veterinário Beta',
      address: 'Rua das Flores, 450 - Centro, Curitiba - PR',
      phone: '(41) 3012-9999',
    },
  });

  // 4. Create Clinic Subscriptions
  console.log('💳 Creating subscriptions...');
  await prisma.clinicSubscription.create({
    data: {
      clinicId: clinicAlfa.id,
      planId: planProfessional.id,
    },
  });

  await prisma.clinicSubscription.create({
    data: {
      clinicId: clinicBeta.id,
      planId: planStarter.id,
    },
  });

  // 5. Create Demo Users (passwords hashed with bcrypt)
  console.log('👥 Creating users...');
  const passwordHash = await bcrypt.hash('Senha123!', 10);

  // Clinic Alfa Users
  const userAlfaAdmin = await prisma.user.create({
    data: {
      email: 'admin@alfa.com',
      password: passwordHash,
      role: Role.ADMIN,
      clinicId: clinicAlfa.id,
    },
  });

  await prisma.user.create({
    data: {
      email: 'staff@alfa.com',
      password: passwordHash,
      role: Role.STAFF,
      clinicId: clinicAlfa.id,
    },
  });

  // Clinic Beta Users
  const userBetaAdmin = await prisma.user.create({
    data: {
      email: 'admin@beta.com',
      password: passwordHash,
      role: Role.ADMIN,
      clinicId: clinicBeta.id,
    },
  });

  // Super Admin (No associated clinic)
  const superAdmin = await prisma.user.create({
    data: {
      email: 'superadmin@vetos.ai',
      password: passwordHash,
      role: Role.SUPERADMIN,
    },
  });

  // Log an impersonation attempt by Super Admin into Clinic Beta for audit testing
  await prisma.impersonationLog.create({
    data: {
      superAdminId: superAdmin.id,
      targetClinicId: clinicBeta.id,
      reason: 'Suporte técnico solicitado para configuração de e-mail.',
    },
  });

  // 6. Create Clients (Tutors)
  console.log('👤 Creating clients/tutors...');
  // Client 1 for Alfa
  const clientAlfa1 = await prisma.client.create({
    data: {
      name: 'João Silva',
      email: 'joao.silva@demo.com',
      phone: '(11) 98888-7777',
      clinicId: clinicAlfa.id,
      cpf: '123.456.789-00',
      rg: '12.345.678-9',
      birthDate: new Date('1985-05-15'),
      whatsapp: '(11) 98888-7777',
      emergencyName: 'Maria Silva',
      emergencyPhone: '(11) 97777-6666',
      postalCode: '01310-100',
      street: 'Avenida Paulista',
      number: '1000',
      complement: 'Apto 42',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
    },
  });

  // Client 2 for Alfa
  const clientAlfa2 = await prisma.client.create({
    data: {
      name: 'Juliana Mendes',
      email: 'juliana.mendes@demo.com',
      phone: '(11) 99999-8888',
      clinicId: clinicAlfa.id,
      cpf: '987.654.321-11',
      whatsapp: '(11) 99999-8888',
      city: 'São Paulo',
      state: 'SP',
    },
  });

  // Client 1 for Beta
  const clientBeta1 = await prisma.client.create({
    data: {
      name: 'Carlos Santos',
      email: 'carlos.santos@demo.com',
      phone: '(41) 95555-4444',
      clinicId: clinicBeta.id,
      cpf: '456.789.123-22',
      whatsapp: '(41) 95555-4444',
      city: 'Curitiba',
      state: 'PR',
    },
  });

  // 7. Create Pets
  console.log('🐱 Creating pets...');
  // Pets for Alfa
  const petAlfa1 = await prisma.pet.create({
    data: {
      name: 'Max',
      species: 'Cachorro',
      breed: 'Golden Retriever',
      age: 3,
      clientId: clientAlfa1.id,
      clinicId: clinicAlfa.id,
    },
  });

  const petAlfa2 = await prisma.pet.create({
    data: {
      name: 'Luna',
      species: 'Gato',
      breed: 'Persa',
      age: 2,
      clientId: clientAlfa1.id,
      clinicId: clinicAlfa.id,
    },
  });

  const petAlfa3 = await prisma.pet.create({
    data: {
      name: 'Thor',
      species: 'Cachorro',
      breed: 'Bulldog Francês',
      age: 1,
      clientId: clientAlfa2.id,
      clinicId: clinicAlfa.id,
    },
  });

  // Pets for Beta
  const petBeta1 = await prisma.pet.create({
    data: {
      name: 'Mel',
      species: 'Cachorro',
      breed: 'Poodle',
      age: 5,
      clientId: clientBeta1.id,
      clinicId: clinicBeta.id,
    },
  });

  // 8. Weight Records
  console.log('⚖️ Creating weight records...');
  await prisma.weightRecord.createMany({
    data: [
      { weight: 28.5, date: new Date('2026-01-10'), petId: petAlfa1.id, clinicId: clinicAlfa.id },
      { weight: 30.2, date: new Date('2026-03-15'), petId: petAlfa1.id, clinicId: clinicAlfa.id },
      { weight: 32.1, date: new Date('2026-06-20'), petId: petAlfa1.id, clinicId: clinicAlfa.id },
      { weight: 4.1, date: new Date('2026-02-18'), petId: petAlfa2.id, clinicId: clinicAlfa.id },
      { weight: 4.3, date: new Date('2026-05-22'), petId: petAlfa2.id, clinicId: clinicAlfa.id },
      { weight: 8.5, date: new Date('2026-04-10'), petId: petBeta1.id, clinicId: clinicBeta.id },
    ],
  });

  // 9. Allergies
  console.log('🤧 Creating allergies...');
  await prisma.allergy.createMany({
    data: [
      { name: 'Dipirona Sódica', petId: petAlfa1.id, clinicId: clinicAlfa.id },
      { name: 'Picada de Pulga', petId: petAlfa1.id, clinicId: clinicAlfa.id },
      { name: 'Penicilina', petId: petBeta1.id, clinicId: clinicBeta.id },
    ],
  });

  // 10. Appointments (Past, Present, Future)
  console.log('📅 Creating appointments...');
  const appAlfaPast = await prisma.appointment.create({
    data: {
      date: new Date('2026-05-10T10:00:00Z'),
      reason: 'Consulta geral de rotina e aplicação de vacina.',
      status: AppointmentStatus.COMPLETED,
      petId: petAlfa1.id,
      clientId: clientAlfa1.id,
      clinicId: clinicAlfa.id,
    },
  });

  const appAlfaToday = await prisma.appointment.create({
    data: {
      date: new Date(), // Today
      reason: 'Retorno para avaliação de dermatite.',
      status: AppointmentStatus.SCHEDULED,
      petId: petAlfa1.id,
      clientId: clientAlfa1.id,
      clinicId: clinicAlfa.id,
    },
  });

  const appAlfaFuture = await prisma.appointment.create({
    data: {
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
      reason: 'Limpeza de tártaro e profilaxia odontológica.',
      status: AppointmentStatus.SCHEDULED,
      petId: petAlfa2.id,
      clientId: clientAlfa1.id,
      clinicId: clinicAlfa.id,
    },
  });

  const appBetaPast = await prisma.appointment.create({
    data: {
      date: new Date('2026-04-20T14:30:00Z'),
      reason: 'Exame de sangue preventivo.',
      status: AppointmentStatus.COMPLETED,
      petId: petBeta1.id,
      clientId: clientBeta1.id,
      clinicId: clinicBeta.id,
    },
  });

  // 11. Vaccine Protocols and Records
  console.log('💉 Creating vaccine protocols & records...');
  // Protocol for Canine Multi-disease
  const protocolV10 = await prisma.vaccineProtocol.create({
    data: {
      name: 'Protocolo Quíntupla/Décupla (V10)',
      species: 'Cachorro',
      clinicId: clinicAlfa.id,
    },
  });

  const dose1 = await prisma.vaccineProtocolDose.create({
    data: {
      protocolId: protocolV10.id,
      vaccineName: 'V10 - 1ª Dose',
      doseOrder: 1,
      intervalDays: 21,
    },
  });

  const dose2 = await prisma.vaccineProtocolDose.create({
    data: {
      protocolId: protocolV10.id,
      vaccineName: 'V10 - 2ª Dose',
      doseOrder: 2,
      intervalDays: 21,
    },
  });

  // Past Applied Vaccine
  await prisma.vaccineRecord.create({
    data: {
      name: 'V10 - 1ª Dose',
      date: new Date('2026-05-10'),
      nextDoseDate: new Date('2026-05-31'),
      status: VaccineStatus.APPLIED,
      protocolId: protocolV10.id,
      protocolDoseId: dose1.id,
      lotNumber: 'VAC12345',
      manufacturer: 'Zoetis',
      appliedById: userAlfaAdmin.id,
      notes: 'Animal bem tolerante à dose.',
      petId: petAlfa1.id,
      clinicId: clinicAlfa.id,
    },
  });

  // Scheduled/Pending Vaccine
  const pendingVaccine = await prisma.vaccineRecord.create({
    data: {
      name: 'V10 - 2ª Dose',
      date: new Date('2026-05-31'),
      status: VaccineStatus.SCHEDULED,
      protocolId: protocolV10.id,
      protocolDoseId: dose2.id,
      petId: petAlfa1.id,
      clinicId: clinicAlfa.id,
    },
  });

  // 12. Clinical Records (Medical Timeline)
  console.log('🩺 Creating clinical records...');
  const recordAlfa = await prisma.clinicalRecord.create({
    data: {
      type: ClinicalRecordType.NOTE,
      title: 'Exame Clínico Geral',
      content: 'Paciente calmo, mucosa corada, frequência cardíaca regular, hidratado. Queixa principal: picada de inseto na pata traseira esquerda com leve edema.',
      date: new Date('2026-05-10T10:30:00Z'),
      petId: petAlfa1.id,
      clinicId: clinicAlfa.id,
    },
  });

  const recordBeta = await prisma.clinicalRecord.create({
    data: {
      type: ClinicalRecordType.PROCEDURE,
      title: 'Coleta de Sangue Periférico',
      content: 'Realizada coleta de sangue da veia cefálica para hemograma e perfil bioquímico básico.',
      date: new Date('2026-04-20T14:45:00Z'),
      petId: petBeta1.id,
      clinicId: clinicBeta.id,
    },
  });

  // 13. Clinical Attachments (Mocked files)
  console.log('📁 Creating clinical attachments...');
  await prisma.clinicalAttachment.create({
    data: {
      clinicId: clinicAlfa.id,
      petId: petAlfa1.id,
      clinicalRecordId: recordAlfa.id,
      originalFileName: 'hemograma_max.pdf',
      storedFileName: 'alfa_max_hemo_10022.pdf',
      mimeType: 'application/pdf',
      fileSize: BigInt(450230),
      storagePath: '/uploads/alfa/alfa_max_hemo_10022.pdf',
      uploadedById: userAlfaAdmin.id,
      notes: 'Laudo normal de triagem pré-consulta.',
    },
  });

  // 14. Prescriptions
  console.log('✍️ Creating prescriptions...');
  // Stable SHA-256 for a signed prescription
  const prescriptionPayload = JSON.stringify({
    medicamento: 'Prednisona 20mg',
    dosagem: '1 comprimido',
    frequencia: 'A cada 24 horas',
    duracao: '5 dias',
    viaAdministracao: 'Oral',
    petId: petAlfa1.id,
    clinicId: clinicAlfa.id,
  });
  const prescriptionHash = crypto.createHash('sha256').update(prescriptionPayload).digest('hex');

  await prisma.prescription.create({
    data: {
      medicamento: 'Prednisona 20mg',
      dosagem: '1 comprimido',
      frequencia: 'A cada 24 horas',
      duracao: '5 dias',
      viaAdministracao: 'Oral',
      observacoes: 'Administrar junto ao alimento.',
      status: DocumentStatus.SIGNED,
      documentHash: prescriptionHash,
      signedAt: new Date(),
      verificationUrl: `/verify/${prescriptionHash}`,
      verificationQrCode: 'MOCK_QR_CODE_DATA',
      petId: petAlfa1.id,
      clinicId: clinicAlfa.id,
      clinicalRecordId: recordAlfa.id,
      appointmentId: appAlfaPast.id,
    },
  });

  // 15. Consent Templates and Terms
  console.log('📝 Creating consent terms...');
  const consentTemplate = await prisma.consentTemplate.create({
    data: {
      name: 'Termo de Consentimento para Cirurgia e Anestesia',
      procedureType: 'Cirúrgico',
      baseText: 'Eu, autorizo a realização do procedimento cirúrgico sob anestesia geral no meu animal de estimação.',
      clinicId: clinicAlfa.id,
    },
  });

  // Term 1: Signed by Clinic (Draft/Signed status but no tutor acceptance yet)
  const termPayload1 = JSON.stringify({
    templateId: consentTemplate.id,
    petId: petAlfa2.id,
    clinicId: clinicAlfa.id,
    text: consentTemplate.baseText,
  });
  const termHash1 = crypto.createHash('sha256').update(termPayload1).digest('hex');

  await prisma.consentTerm.create({
    data: {
      petId: petAlfa2.id,
      clinicId: clinicAlfa.id,
      appointmentId: appAlfaFuture.id,
      consentTemplateId: consentTemplate.id,
      finalText: consentTemplate.baseText,
      status: DocumentStatus.DRAFT,
      documentHash: termHash1,
      verificationUrl: `/verify/${termHash1}`,
      tutorSigned: false,
    },
  });

  // Term 2: Fully Signed by Tutor (Tutor verification and acceptance complete)
  const termPayload2 = JSON.stringify({
    templateId: consentTemplate.id,
    petId: petAlfa1.id,
    clinicId: clinicAlfa.id,
    text: consentTemplate.baseText,
  });
  const termHash2 = crypto.createHash('sha256').update(termPayload2).digest('hex');

  await prisma.consentTerm.create({
    data: {
      petId: petAlfa1.id,
      clinicId: clinicAlfa.id,
      appointmentId: appAlfaPast.id,
      consentTemplateId: consentTemplate.id,
      finalText: consentTemplate.baseText,
      status: DocumentStatus.SIGNED,
      documentHash: termHash2,
      signedAt: new Date('2026-05-10T10:05:00Z'),
      verificationUrl: `/verify/${termHash2}`,
      verificationQrCode: 'MOCK_QR_CODE_TERM_2',
      tutorSigned: true,
      tutorSignedAt: new Date('2026-05-10T10:05:00Z'),
      tutorSignatureName: 'João Silva',
      tutorSignatureCpf: '123.456.789-00',
      tutorSignatureIp: '200.189.45.12',
      tutorSignatureUserAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  });

  // 16. Notification Configuration and Templates
  console.log('⚙️ Creating notification configs & templates...');
  await prisma.notificationConfig.create({
    data: {
      clinicId: clinicAlfa.id,
      emailEnabled: true,
      smtpHost: 'sandbox.smtp.mailtrap.io',
      smtpPort: 2525,
      smtpUser: 'alfa_user',
      smtpPasswordEncrypted: 'ENCRYPTED_PASSWORD_PLACEHOLDER',
      smtpFromName: 'Clínica Alfa',
      smtpFromEmail: 'alfa@demo.com',
      whatsappEnabled: true,
      whatsappInstanceUrl: 'http://localhost:8080',
      whatsappInstanceName: 'alfa_whatsapp_instance',
      whatsappApiKeyEncrypted: 'ENCRYPTED_API_KEY_PLACEHOLDER',
    },
  });

  await prisma.notificationTemplate.createMany({
    data: [
      {
        clinicId: clinicAlfa.id,
        event: 'CONFIRMACAO_AGENDAMENTO',
        channel: NotificationChannel.EMAIL,
        subject: 'Confirmação de Consulta - Clínica Alfa',
        body: 'Olá {{ tutor }}, sua consulta para {{ pet }} está confirmada para dia {{ data }}.',
      },
      {
        clinicId: clinicAlfa.id,
        event: 'LEMBRETE_VACINA',
        channel: NotificationChannel.WHATSAPP,
        body: 'Olá {{ tutor }}, a vacina {{ vacina }} de {{ pet }} está próxima do vencimento. Entre em contato para agendar.',
      },
    ],
  });

  // 17. Notification Logs
  console.log('📊 Creating notification logs...');
  await prisma.notificationLog.createMany({
    data: [
      {
        clinicId: clinicAlfa.id,
        channel: NotificationChannel.EMAIL,
        to: 'joao.silva@demo.com',
        subject: 'Confirmação de Consulta - Clínica Alfa',
        body: 'Olá João Silva, sua consulta para Max está confirmada.',
        status: NotificationStatus.SENT,
        event: 'CONFIRMACAO_AGENDAMENTO',
        sentAt: new Date(),
        clientId: clientAlfa1.id,
        petId: petAlfa1.id,
        appointmentId: appAlfaPast.id,
      },
      {
        clinicId: clinicAlfa.id,
        channel: NotificationChannel.WHATSAPP,
        to: '(11) 98888-7777',
        body: 'Olá João Silva, a vacina V10 - 2ª Dose de Max está próxima do vencimento.',
        status: NotificationStatus.PENDING,
        event: 'LEMBRETE_VACINA',
        clientId: clientAlfa1.id,
        petId: petAlfa1.id,
        vaccineRecordId: pendingVaccine.id,
      },
    ],
  });

  console.log('✅ Database seeding successfully completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
