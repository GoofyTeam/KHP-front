// compress.ts
export const TWO_MB = 2 * 1024 * 1024;

type Options = {
  maxSizeBytes?: number;
  maxWidth?: number;
  maxHeight?: number;
  initialQuality?: number;
  minQuality?: number;
  mimeType?: string; // "image/jpeg" | "image/webp"
};

export async function compressImageFile(
  file: File,
  opts: Options = {}
): Promise<File> {
  const {
    maxSizeBytes = TWO_MB,
    maxWidth = 1600,
    maxHeight = 1600,
    initialQuality = 0.9,
    minQuality = 0.55,
    mimeType = "image/jpeg",
  } = opts;

  if (!file.type.startsWith("image/")) return file;

  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const url = URL.createObjectURL(file);
    const i = new Image();
    i.onload = () => {
      URL.revokeObjectURL(url);
      res(i);
    };
    i.onerror = (e) => {
      URL.revokeObjectURL(url);
      rej(e);
    };
    i.src = url;
  });

  // ratio
  let w = img.naturalWidth;
  let h = img.naturalHeight;
  const s = Math.min(1, maxWidth / w, maxHeight / h);
  w = Math.max(1, Math.round(w * (isFinite(s) ? s : 1)));
  h = Math.max(1, Math.round(h * (isFinite(s) ? s : 1)));

  let canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);

  const toBlob = (q: number) =>
    new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => resolve(b ?? new Blob()), mimeType, q)
    );

  let q = initialQuality;
  let blob = await toBlob(q);

  while (blob.size > maxSizeBytes && q > minQuality) {
    q = Math.max(minQuality, q - 0.05);
    blob = await toBlob(q);
  }
  while (
    blob.size > maxSizeBytes &&
    (canvas.width > 300 || canvas.height > 300)
  ) {
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(canvas.width * 0.85));
    c.height = Math.max(1, Math.round(canvas.height * 0.85));
    c.getContext("2d")!.drawImage(canvas, 0, 0, c.width, c.height);
    canvas = c;
    blob = await toBlob(q);
  }

  const name = file.name.replace(
    /\.(heic|heif)$/i,
    mimeType === "image/webp" ? ".webp" : ".jpg"
  );
  return new File([blob], name, { type: mimeType });
}
