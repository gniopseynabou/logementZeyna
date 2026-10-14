/**
 * Utilitaire de validation de complexité des mots de passe (SEC-009).
 * Exige au minimum 8 caractères, dont au moins une lettre et un chiffre.
 */

export interface PasswordValidationResult {
  isValid: boolean;
  message?: string;
}

export const validatePassword = (password: string): PasswordValidationResult => {
  if (!password || password.length < 8) {
    return {
      isValid: false,
      message: "Le mot de passe doit contenir au moins 8 caractères.",
    };
  }

  const hasLetter = /[a-zA-Z]/.test(password);
  const hasDigit = /\d/.test(password);

  if (!hasLetter || !hasDigit) {
    return {
      isValid: false,
      message: "Le mot de passe doit contenir au moins une lettre et un chiffre.",
    };
  }

  return { isValid: true };
};
