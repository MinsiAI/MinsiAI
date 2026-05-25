export type QRProvider = "wechat" | "qq";

export type QRLoginApiStatus = "pending" | "scanned" | "confirmed" | "expired" | "error";

export interface QRCodeResponse {
  qrId: string;
  qrImageUrl: string;
  expiresInSeconds: number;
}

export interface QRLoginStatusResponse {
  status: QRLoginApiStatus;
}

export interface LoginActionResponse {
  ok: boolean;
}

const QR_EXPIRES_IN_SECONDS = 120;
const mockPollAttempts = new Map<string, number>();

const qrPatterns: Record<QRProvider, string[]> = {
  wechat: [
    "111111000111111",
    "100001010100001",
    "101101111101101",
    "101101001101101",
    "101101111101101",
    "100001010100001",
    "111111101111111",
    "000000010000000",
    "110101111001011",
    "011010001110100",
    "111101101011111",
    "100011011101001",
    "101110100111101",
    "100000111001001",
    "111111001111111"
  ],
  qq: [
    "111111001111111",
    "100001101000001",
    "101101001011101",
    "101101111011101",
    "101101010011101",
    "100001111000001",
    "111111001111111",
    "000000110000000",
    "101011111010111",
    "111100010111001",
    "100111101001101",
    "111001011110111",
    "101111000101001",
    "100010111011101",
    "111111101111111"
  ]
};

function delay(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function getMockQrPreviewImage(provider: QRProvider) {
  const pattern = qrPatterns[provider];
  const cells = pattern
    .flatMap((row, rowIndex) =>
      row.split("").map((cell, columnIndex) => {
        if (cell !== "1") {
          return "";
        }

        return `<rect x="${columnIndex + 3}" y="${rowIndex + 3}" width="1" height="1" fill="black" />`;
      })
    )
    .join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21" shape-rendering="crispEdges" aria-label="${provider} QR code"><rect width="21" height="21" fill="white" />${cells}</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export async function requestQrCode(provider: QRProvider): Promise<QRCodeResponse> {
  // TODO: Replace this mock with the real auth service endpoint.
  await delay(260);

  const qrId = `${provider}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  mockPollAttempts.set(qrId, 0);

  return {
    qrId,
    qrImageUrl: getMockQrPreviewImage(provider),
    expiresInSeconds: QR_EXPIRES_IN_SECONDS
  };
}

export async function pollQrLoginStatus(provider: QRProvider, qrId: string): Promise<QRLoginStatusResponse> {
  // TODO: Replace this mock with backend polling for the selected provider only.
  void provider;
  await delay(180);

  const nextAttempt = (mockPollAttempts.get(qrId) ?? 0) + 1;
  mockPollAttempts.set(qrId, nextAttempt);

  if (nextAttempt >= 5) {
    return { status: "scanned" };
  }

  return { status: "pending" };
}

export async function sendEmailCode(email: string): Promise<LoginActionResponse> {
  // TODO: Call the backend endpoint that sends an email code.
  void email;
  await delay(420);

  return { ok: true };
}

export async function loginWithEmailCode(email: string, code: string): Promise<LoginActionResponse> {
  // TODO: The backend should validate the code and set an HttpOnly Secure Cookie.
  void email;
  await delay(460);

  return { ok: code.trim().length >= 4 };
}
