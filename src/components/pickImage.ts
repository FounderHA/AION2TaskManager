// Escolher uma imagem do PC e reduzir para um quadrado pequeno (data URL salvo no dados.json).
export interface PickOptions {
  size: number;
  /** contain: imagem inteira com bordas transparentes; cover: preenche o quadrado cortando as sobras. */
  fit: "contain" | "cover";
  type?: "image/png" | "image/jpeg";
}

export function pickImage({ size, fit, type = "image/png" }: PickOptions): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/png,image/jpeg,image/webp,image/gif";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return resolve(null);
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Não foi possível ler a imagem."));
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error("Arquivo de imagem inválido."));
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext("2d");
          if (!ctx) return reject(new Error("Não foi possível processar a imagem."));
          ctx.imageSmoothingQuality = "high";
          if (fit === "cover") {
            const side = Math.min(img.width, img.height);
            ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size);
          } else {
            const scale = Math.min(size / img.width, size / img.height, 1);
            const w = Math.max(1, Math.round(img.width * scale));
            const h = Math.max(1, Math.round(img.height * scale));
            ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
          }
          resolve(canvas.toDataURL(type, 0.88));
        };
        img.src = String(reader.result);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  });
}
