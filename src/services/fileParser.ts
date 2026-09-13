import mammoth from 'mammoth';

// Extract plain text from TXT, DOCX, or PDF ArrayBuffer
export async function extractTextFromFile(file: File): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (extension === 'txt') {
    return await file.text();
  }

  if (extension === 'docx') {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  }

  if (extension === 'pdf') {
    try {
      const pdfjsLib = await import('pdfjs-dist');
      // Set worker source safely for Vite
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
      }
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
      const pdf = await loadingTask.promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => ('str' in item ? item.str : ''))
          .join(' ');
        fullText += pageText + '\n';
      }

      return fullText.trim();
    } catch (err: any) {
      console.warn('PDF parsing with pdfjs-dist encountered issue, trying fallback:', err);
      // Fallback: read text representation
      const rawText = await file.text();
      // Simple regex extraction of text stream if text representation exists
      const cleaned = rawText.replace(/[^a-zA-Z0-9\s.,@:\-\/]/g, ' ');
      if (cleaned.length > 50) return cleaned;
      throw new Error(`PDF text extraction failed: ${err.message || 'Corrupted or password-protected PDF'}`);
    }
  }

  throw new Error(`Unsupported file type: .${extension}. Only PDF, DOCX, and TXT are accepted.`);
}
