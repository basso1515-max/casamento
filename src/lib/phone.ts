function nationalDigits(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.startsWith("55") && digits.length > 11 ? digits.slice(2) : digits;
}

export function normalizeBrazilianMobile(value: string) {
  const digits = nationalDigits(value);

  if (!/^[1-9][0-9]9[0-9]{8}$/.test(digits)) return null;
  return `+55${digits}`;
}

export function formatBrazilianPhoneInput(value: string) {
  const digits = nationalDigits(value).slice(0, 11);
  if (!digits) return "";
  if (digits.length < 3) return `(${digits}`;

  const areaCode = digits.slice(0, 2);
  const number = digits.slice(2);
  if (number.length <= 5) return `(${areaCode}) ${number}`;

  return `(${areaCode}) ${number.slice(0, 5)}-${number.slice(5)}`;
}

export function formatBrazilianPhone(value: string, includeCountryCode = false) {
  const normalized = normalizeBrazilianMobile(value);
  if (!normalized) return value;

  const formatted = formatBrazilianPhoneInput(normalized);
  return includeCountryCode ? `+55 ${formatted}` : formatted;
}
