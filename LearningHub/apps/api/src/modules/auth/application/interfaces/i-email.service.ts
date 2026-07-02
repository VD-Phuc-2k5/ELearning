export interface IEmailService {
  sendPasswordResetEmail(to: string, resetLink: string): Promise<void>;
}
