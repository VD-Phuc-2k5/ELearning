import { seedRoles, seedQuestionBankStatuses } from './db-helper';

export default async function globalSetup() {
  await seedRoles();
  await seedQuestionBankStatuses();
}
