/**
 * StarX-Flow Multi-Tenant Document Parser
 * Parses and extracts text content from PDF, DOCX, Website URLs, and Plain Text/Markdown documents.
 */

import zlib from 'node:zlib';

export interface ParsedDocument {
  title: string;
  content: string;
  documentType: 'pdf' | 'docx' | 'url' | 'text' | 'faq';
  sourceUrl?: string;
  charCount: number;
  wordCount: number;
  metadata?: Record<string, any>;
}

export class DocumentParser {
  private static readonly MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
  private static readonly MAX_URL_FETCH_BYTES = 2 * 1024 * 1024;  // 2 MB

  /**
   * Validates file size and basic safety before parsing.
   */
  static validateFileSize(sizeBytes: number): void {
    if (sizeBytes <= 0) {
      throw new Error('File is empty (0 bytes).');
    }
    if (sizeBytes > this.MAX_FILE_SIZE_BYTES) {
      throw new Error(`File size exceeds maximum allowed limit of ${this.MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB.`);
    }
  }

  /**
   * Extracts clean text from plain text or markdown buffer/string.
   */
  static parseText(rawText: string | Buffer, title = 'Text Document'): ParsedDocument {
    const text = typeof rawText === 'string' ? rawText : rawText.toString('utf-8');
    const cleaned = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();

    if (!cleaned) {
      throw new Error('Document contains no extractable text content.');
    }

    const words = cleaned.split(/\s+/).filter(Boolean);

    return {
      title,
      content: cleaned,
      documentType: 'text',
      charCount: cleaned.length,
      wordCount: words.length,
    };
  }

  /**
   * SSRF Protection: Checks if a hostname or IP address resolves to private, loopback, or metadata ranges.
   */
  static isPrivateOrReservedHost(hostname: string): boolean {
    const cleanHost = hostname.trim().toLowerCase().replace(/^\[|\]$/g, '');

    // Hostname checks
    if (
      cleanHost === 'localhost' ||
      cleanHost.endsWith('.localhost') ||
      cleanHost.endsWith('.local') ||
      cleanHost.endsWith('.internal') ||
      cleanHost.endsWith('.arpa')
    ) {
      return true;
    }

    // IPv6 checks
    if (
      cleanHost === '::1' ||
      cleanHost === '::' ||
      cleanHost.startsWith('fe80:') ||
      cleanHost.startsWith('fc00:') ||
      cleanHost.startsWith('fd00:')
    ) {
      return true;
    }

    // IPv4 checks
    const ipv4Match = cleanHost.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (ipv4Match) {
      const octet1 = parseInt(ipv4Match[1], 10);
      const octet2 = parseInt(ipv4Match[2], 10);

      // 0.0.0.0/8 (Broadcast/Current)
      if (octet1 === 0) return true;
      // 127.0.0.0/8 (Loopback)
      if (octet1 === 127) return true;
      // 10.0.0.0/8 (Private)
      if (octet1 === 10) return true;
      // 169.254.0.0/16 (Link-local & Cloud Metadata e.g. AWS/GCP 169.254.169.254)
      if (octet1 === 169 && octet2 === 254) return true;
      // 172.16.0.0/12 (Private: 172.16.x.x - 172.31.x.x)
      if (octet1 === 172 && octet2 >= 16 && octet2 <= 31) return true;
      // 192.168.0.0/16 (Private)
      if (octet1 === 192 && octet2 === 168) return true;
      // 100.64.0.0/10 (Carrier-grade NAT)
      if (octet1 === 100 && octet2 >= 64 && octet2 <= 127) return true;
    }

    return false;
  }

  /**
   * Extracts text from website URL by fetching HTML and stripping non-content tags.
   */
  static async parseUrl(url: string, customTitle?: string): Promise<ParsedDocument> {
    try {
      const parsedUrl = new URL(url);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error('Invalid URL protocol. Only HTTP and HTTPS are supported.');
      }

      if (this.isPrivateOrReservedHost(parsedUrl.hostname)) {
        throw new Error('SECURITY VIOLATION: URL points to a restricted internal or private network address (SSRF protection).');
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; StarXFlowBot/1.0; +https://starx-flow.runs-on.dev)',
          Accept: 'text/html,application/xhtml+xml,text/plain',
        },
      });
      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`Failed to fetch URL: HTTP ${response.status} ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('text/html') && !contentType.includes('text/plain')) {
        throw new Error(`Unsupported content type: ${contentType}. Expected text/html or text/plain.`);
      }

      const html = await response.text();
      if (html.length > this.MAX_URL_FETCH_BYTES) {
        throw new Error('Web page content exceeds 2MB limit.');
      }

      // Extract title from <title> tag
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = customTitle || (titleMatch ? titleMatch[1].trim() : parsedUrl.hostname);

      // Clean HTML: Remove scripts, styles, iframes, SVGs, nav, headers, footers
      let cleaned = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
        .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, ' ')
        .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, ' ')
        .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, ' ')
        .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, ' ')
        .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, ' ')
        .replace(/<[^>]+>/g, ' ') // Strip remaining HTML tags
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&quot;/gi, '"')
        .replace(/\s+/g, ' ')
        .trim();

      if (!cleaned || cleaned.length < 30) {
        throw new Error('Web page returned insufficient extractable text.');
      }

      const words = cleaned.split(/\s+/).filter(Boolean);

      return {
        title,
        content: cleaned,
        documentType: 'url',
        sourceUrl: url,
        charCount: cleaned.length,
        wordCount: words.length,
        metadata: {
          hostname: parsedUrl.hostname,
          url,
        },
      };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new Error('Request timed out while fetching website URL (exceeded 8s).');
      }
      throw err;
    }
  }

  /**
   * Extracts text from DOCX buffer (OpenXML zip container).
   */
  static async parseDocx(buffer: Buffer, title = 'Word Document'): Promise<ParsedDocument> {
    this.validateFileSize(buffer.length);

    try {
      // DOCX files are zip packages containing word/document.xml
      const textFromXml = this.extractTextFromZip(buffer, 'word/document.xml');
      if (!textFromXml) {
        throw new Error('Could not find word/document.xml in DOCX container.');
      }

      // Extract all <w:t>...</w:t> text nodes
      const textMatches = textFromXml.match(/<w:t[^>]*>([^<]*)<\/w:t>/g) || [];
      const extractedPieces = textMatches.map((m) => m.replace(/<[^>]+>/g, ''));
      const combined = extractedPieces.join(' ').replace(/\s+/g, ' ').trim();

      if (!combined) {
        throw new Error('DOCX document contains no extractable text.');
      }

      return {
        title,
        content: combined,
        documentType: 'docx',
        charCount: combined.length,
        wordCount: combined.split(/\s+/).filter(Boolean).length,
      };
    } catch (err: any) {
      throw new Error(`DOCX Extraction Error: ${err.message}`);
    }
  }

  /**
   * Extracts text from PDF buffer.
   */
  static async parsePdf(buffer: Buffer, title = 'PDF Document'): Promise<ParsedDocument> {
    this.validateFileSize(buffer.length);

    try {
      const rawString = buffer.toString('binary');
      
      // Check PDF header
      if (!rawString.startsWith('%PDF-')) {
        throw new Error('File does not have a valid PDF header (%PDF-).');
      }

      // Check for password protection/encryption
      if (rawString.includes('/Encrypt')) {
        throw new Error('Password-protected or encrypted PDFs are not supported.');
      }

      // Extract text streams between BT (Begin Text) and ET (End Text)
      const textPieces: string[] = [];
      const btEtRegex = /BT[\s\S]*?ET/g;
      let match: RegExpExecArray | null;

      while ((match = btEtRegex.exec(rawString)) !== null) {
        const block = match[0];
        // Extract strings in parentheses: (Sample text) Tj or [(Sample) 10 (text)] TJ
        const stringRegex = /\(([^)]+)\)/g;
        let strMatch: RegExpExecArray | null;
        while ((strMatch = stringRegex.exec(block)) !== null) {
          const cleanPiece = strMatch[1]
            .replace(/\\([()\\])/g, '$1')
            .replace(/\\n/g, '\n')
            .replace(/\\r/g, '')
            .replace(/\\t/g, ' ')
            .trim();
          if (cleanPiece) {
            textPieces.push(cleanPiece);
          }
        }
      }

      let combined = textPieces.join(' ').replace(/\s+/g, ' ').trim();

      // If BT...ET extraction yielded too few text characters (e.g. compressed /FlateDecode streams),
      // decompress streams and extract printable tokens
      if (combined.length < 50) {
        combined = this.extractFromFlateStreams(buffer);
      }

      if (!combined || combined.length < 20) {
        throw new Error('PDF contains scanned images or no readable text layer.');
      }

      return {
        title,
        content: combined,
        documentType: 'pdf',
        charCount: combined.length,
        wordCount: combined.split(/\s+/).filter(Boolean).length,
      };
    } catch (err: any) {
      throw new Error(`PDF Extraction Error: ${err.message}`);
    }
  }

  /**
   * Helper: Decompresses zlib streams in PDF and extracts readable words.
   */
  private static extractFromFlateStreams(buffer: Buffer): string {
    const raw = buffer.toString('binary');
    const streamRegex = /stream[\r\n]+([\s\S]*?)[\r\n]+endstream/g;
    let match: RegExpExecArray | null;
    const extractedWords: string[] = [];

    while ((match = streamRegex.exec(raw)) !== null) {
      const streamData = Buffer.from(match[1], 'binary');
      try {
        const decompressed = zlib.inflateSync(streamData).toString('utf-8');
        // Extract tokens in parentheses
        const strMatches = decompressed.match(/\(([^)]+)\)/g);
        if (strMatches) {
          for (const s of strMatches) {
            const word = s.slice(1, -1).trim();
            if (word.length > 1 && !word.startsWith('/')) {
              extractedWords.push(word);
            }
          }
        }
      } catch {
        // Stream may not be zlib-compressed or is binary image data, ignore
      }
    }

    return extractedWords.join(' ').replace(/\s+/g, ' ').trim();
  }

  /**
   * Minimal zip stream extractor for DOCX (locates named file entry inside zip).
   */
  private static extractTextFromZip(buffer: Buffer, targetPath: string): string | null {
    let offset = 0;
    while (offset < buffer.length - 30) {
      // Local file header signature: 0x04034b50
      if (
        buffer[offset] === 0x50 &&
        buffer[offset + 1] === 0x4b &&
        buffer[offset + 2] === 0x03 &&
        buffer[offset + 3] === 0x04
      ) {
        const compressionMethod = buffer.readUInt16LE(offset + 8);
        const compressedSize = buffer.readUInt32LE(offset + 18);
        const fileNameLength = buffer.readUInt16LE(offset + 26);
        const extraFieldLength = buffer.readUInt16LE(offset + 28);

        const fileName = buffer.toString('utf-8', offset + 30, offset + 30 + fileNameLength);
        const dataOffset = offset + 30 + fileNameLength + extraFieldLength;

        if (fileName === targetPath) {
          const compressedData = buffer.subarray(dataOffset, dataOffset + compressedSize);
          if (compressionMethod === 8) {
            // Deflate compression
            return zlib.inflateRawSync(compressedData).toString('utf-8');
          } else if (compressionMethod === 0) {
            // Uncompressed
            return compressedData.toString('utf-8');
          }
        }

        offset = dataOffset + compressedSize;
      } else {
        offset++;
      }
    }
    return null;
  }
}
