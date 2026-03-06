export const isExternalImage = (url: string | null | undefined): boolean => {
  if (!url) return false;
  // Verificamos si es el dominio permitido
  return url.includes('covers.openlibrary.org');
};