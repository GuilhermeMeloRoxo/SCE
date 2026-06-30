export async function processarCanvasAvatarParaWebp(
  cropperInstance: Cropper,
  nomeArquivo: string = "imagem.webp"
): Promise<File | null> {
  const canvas = cropperInstance.getCroppedCanvas({
    width: 400,
    height: 400,
  });

  if (!canvas) return null;

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((result) => resolve(result), "image/webp", 0.8);
  });

  if (!blob) return null;

  return new File([blob], nomeArquivo, { type: "image/webp" });
}

export async function processarCanvasPostParaWebp(
  cropperInstance: Cropper,
  nomeArquivo: string = "post_banner.webp"
): Promise<File | null> {
  const canvas = cropperInstance.getCroppedCanvas({
    width: 800,
    height: 450,
  });

  if (!canvas) return null;

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((result) => resolve(result), "image/webp", 0.9);
  });

  if (!blob) return null;

  return new File([blob], nomeArquivo, { type: "image/webp" });
}

