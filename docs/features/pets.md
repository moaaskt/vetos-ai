# Feature: Pets Management

Gerenciamento de fichas cadastrais dos pacientes da clínica (animais de estimação).

## Entidade Pet
Mapeada no Prisma com os seguintes campos:
* `id` (UUID)
* `name` (Nome do pet)
* `species` (Espécie: `DOG`, `CAT`, `OTHER`)
* `breed` (Raça / Pelagem - opcional)
* `age` (Idade estimada em anos - opcional)
* `clientId` (ID do tutor responsável)
* `clinicId` (ID da clínica proprietária/tenant)

## Regras de Negócio
1. **Espécies Permitidas**: Apenas `DOG` (Cão), `CAT` (Gato) e `OTHER` (Outro) são aceitos. A validação é aplicada no backend.
2. **Dependência de Tutor**: Um pet deve sempre estar vinculado a um tutor cadastrado (`Client`).
3. **Isolamento de Tenant**: Um pet cadastrado em uma clínica Alfa só é acessível e modificável por membros autenticados da clínica Alfa.
