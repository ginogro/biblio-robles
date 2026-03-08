export const isExternalImage = (url: string | null | undefined): boolean => {
  if (!url) return false;
  // Verificamos si es el dominio permitido
  return url.includes('covers.openlibrary.org');
};

export const calculateOverdueDays = (dueDate: string): number => {
  if (!dueDate) return 0
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Reset time part to hours

  const due = new Date(dueDate)
  const diffTime = due.getTime() - today.getTime()
  const daysDiff = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return daysDiff
}