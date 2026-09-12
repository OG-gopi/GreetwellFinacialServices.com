/**
 * Validates Indian mobile numbers.
 * Requirements:
 * - Accept numeric digits (stripping optional country code / formatting symbols)
 * - Raw digit count must be between 10 and 12 digits
 * - Reject invalid lengths or non-numeric inputs with clear message:
 *   "Please enter a valid Indian mobile number using 10–12 digits."
 */
export function validateIndianMobile(phone: string | null | undefined): { isValid: boolean; message?: string; cleanPhone?: string } {
  if (!phone || !phone.trim()) {
    return { isValid: false, message: 'Mobile number is required.' };
  }

  const raw = phone.trim();
  const digitsOnly = raw.replace(/\D/g, '');

  if (digitsOnly.length < 10 || digitsOnly.length > 12) {
    return {
      isValid: false,
      message: 'Please enter a valid Indian mobile number using 10–12 digits.',
    };
  }

  return {
    isValid: true,
    cleanPhone: `+${digitsOnly}`,
  };
}
