import type { UploadedFile } from "../types";

export const fileToBase64 = (file: File): Promise<UploadedFile> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const value = String(reader.result ?? "");
      const [, data = ""] = value.split(",");

      resolve({
        id: `${file.name}-${file.lastModified}-${file.size}`,
        name: file.name,
        mimeType: file.type || "application/octet-stream",
        data,
      });
    };

    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

export const downloadJson = (value: unknown, fileName = "extraction-result.json") => {
  const blob = new Blob([JSON.stringify(value, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
};
