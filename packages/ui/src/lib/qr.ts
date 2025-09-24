import QRCode from "qrcode";

export type QRErrorCorrection = "L" | "M" | "Q" | "H";
export type QROutput = "base64" | "blob";

export interface QRParams {
  text: string;
  output?: QROutput;
  colorDark?: string;
  colorLight?: string;
  margin?: number;
  scale?: number;
  errorCorrectionLevel?: QRErrorCorrection;
}

export async function generateQRCode({
  text,
  output = "base64",
  colorDark = "#000000",
  colorLight = "#FFFFFF",
  margin = 4,
  scale = 8,
  errorCorrectionLevel = "M",
}: QRParams): Promise<string | Blob> {
  if (!text || typeof text !== "string") {
    throw new Error("`text` parameter is required and must be a string.");
  }

  const options: QRCode.QRCodeToDataURLOptions & QRCode.QRCodeToBufferOptions =
    {
      errorCorrectionLevel,
      margin,
      scale,
      color: { dark: colorDark, light: colorLight },
    };

  if (output === "base64") {
    const dataUrl = await QRCode.toDataURL(text, options);
    return dataUrl;
  }

  const buffer = await QRCode.toBuffer(text, options);
  return new Blob([new Uint8Array(buffer)], { type: "image/png" });
}

export async function generateQRBuffer(
  params: Omit<QRParams, "output">
): Promise<Buffer> {
  const {
    text,
    colorDark = "#000000",
    colorLight = "#FFFFFF",
    margin = 4,
    scale = 8,
    errorCorrectionLevel = "M",
  } = params;

  const options: QRCode.QRCodeToBufferOptions = {
    errorCorrectionLevel,
    margin,
    scale,
    color: { dark: colorDark, light: colorLight },
    type: "png",
  };

  return QRCode.toBuffer(text, options);
}

export function generateQRCodeSync(
  text: string,
  {
    colorDark = "#000000",
    colorLight = "#FFFFFF",
    margin = 4,
    scale = 8,
  }: {
    colorDark?: string;
    colorLight?: string;
    margin?: number;
    scale?: number;
  } = {}
): string {
  const qr = QRCode.create(text, {
    errorCorrectionLevel: "M",
  });

  const cellSize = scale;
  const marginSize = margin;

  const size = (qr.modules.size + marginSize * 2) * cellSize;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = colorLight;
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = colorDark;
  qr.modules.data.forEach((bit, i) => {
    if (bit) {
      const col = Math.floor(i % qr.modules.size);
      const row = Math.floor(i / qr.modules.size);
      ctx.fillRect(
        (col + marginSize) * cellSize,
        (row + marginSize) * cellSize,
        cellSize,
        cellSize
      );
    }
  });

  return canvas.toDataURL("image/png");
}
