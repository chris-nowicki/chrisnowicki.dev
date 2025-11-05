export function formatCloudinaryText(text: string): string {
  if (!text.includes(',')) {
    return text
  }

  const CLOUDINARY_COMMA = '%E2%80%9A'

  return text.replace(/,/g, CLOUDINARY_COMMA)
}
