// lib/books-api.ts

interface BookData {
  title: string;
  author: string;
  cover_url: string;
  isbn: string;
  description: string;
}

// Función existente: Buscar por ISBN
export async function fetchBookByISBN(isbn: string): Promise<BookData | null> {
  try {
    const response = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`);
    const data = await response.json();

    const bookKey = `ISBN:${isbn}`;
    if (!data[bookKey]) return null;

    const bookInfo = data[bookKey];
    return {
      title: bookInfo.title,
      author: bookInfo.authors?.[0]?.name || 'Desconocido',
      cover_url: bookInfo.cover?.medium || '',
      isbn: isbn,
      description: `Páginas: ${bookInfo.number_of_pages || 'N/A'}`
    };
  } catch (error) {
    console.error("Error fetching by ISBN:", error);
    return null;
  }
}

// NUEVA FUNCIÓN: Buscar por Título
export async function searchBooksByTitle(title: string): Promise<BookData[]> {
  try {
    // Buscamos en OpenLibrary Search API
    const response = await fetch(`https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&limit=5`);
    const data = await response.json();

    if (!data.docs) return [];

    // Mapeamos los resultados a un formato estándar
    return data.docs.map((doc: any) => ({
      title: doc.title,
      author: doc.author_name?.[0] || 'Desconocido',
      cover_url: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : '',
      isbn: doc.isbn?.[0] || '', // Tomamos el primer ISBN disponible
      description: `Publicado: ${doc.first_publish_year || 'N/A'}`
    }));
  } catch (error) {
    console.error("Error searching by title:", error);
    return [];
  }
}