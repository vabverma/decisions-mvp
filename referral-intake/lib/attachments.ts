export type AttachmentMediaType = "application/pdf" | "image/png" | "image/jpeg" | "image/webp" | "image/gif";

export interface Attachment {
  filename: string;
  mediaType: AttachmentMediaType;
  base64: string;
}

export const ALLOWED_ATTACHMENT_TYPES: AttachmentMediaType[] = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
];

export const MAX_ATTACHMENTS = 5;
export const MAX_ATTACHMENT_BYTES = 18 * 1024 * 1024;

export function isAllowedAttachmentType(mediaType: string): mediaType is AttachmentMediaType {
  return (ALLOWED_ATTACHMENT_TYPES as string[]).includes(mediaType);
}

export function fileToAttachment(file: File): Promise<Attachment> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error(`Could not read file "${file.name}".`));
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.slice(result.indexOf(",") + 1);
      resolve({ filename: file.name, mediaType: file.type as AttachmentMediaType, base64 });
    };
    reader.readAsDataURL(file);
  });
}
