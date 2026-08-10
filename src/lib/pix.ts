type PixPayloadOptions = {
  key: string;
  recipientName: string;
  city: string;
};

function emvField(id: string, value: string) {
  if (value.length > 99) {
    throw new Error(`O campo PIX ${id} excede o tamanho permitido.`);
  }

  return `${id}${value.length.toString().padStart(2, "0")}${value}`;
}

function normalizeMerchantField(value: string, maxLength: number) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9 $%*+\-./:]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase()
    .slice(0, maxLength);
}

function crc16Ccitt(value: string) {
  let crc = 0xffff;

  for (let index = 0; index < value.length; index += 1) {
    crc ^= value.charCodeAt(index) << 8;

    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export function createPixPayload({ key, recipientName, city }: PixPayloadOptions) {
  const normalizedKey = key.trim();
  const normalizedName = normalizeMerchantField(recipientName, 25);
  const normalizedCity = normalizeMerchantField(city, 15);

  if (!normalizedKey || !normalizedName || !normalizedCity) {
    throw new Error("Chave, favorecido e cidade são obrigatórios para gerar o QR Code PIX.");
  }

  const merchantAccount = [
    emvField("00", "BR.GOV.BCB.PIX"),
    emvField("01", normalizedKey),
  ].join("");
  const additionalData = emvField("05", "***");
  const payloadWithoutCrc = [
    emvField("00", "01"),
    emvField("26", merchantAccount),
    emvField("52", "0000"),
    emvField("53", "986"),
    emvField("58", "BR"),
    emvField("59", normalizedName),
    emvField("60", normalizedCity),
    emvField("62", additionalData),
    "6304",
  ].join("");

  return `${payloadWithoutCrc}${crc16Ccitt(payloadWithoutCrc)}`;
}
