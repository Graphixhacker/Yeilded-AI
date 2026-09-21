import { createRequire } from 'module';
import { callDeepSeekOrFallback } from './aiService.ts';
import type { StudyGuideSummary } from '../src/types/index.ts';

const require = createRequire(import.meta.url);

export interface ExtractedPdfResult {
  text: string;
  pageCount: number;
}

/**
 * Extracts text and page count from a PDF Buffer using pdf-parse.
 */
export async function extractPdfText(buffer: Buffer): Promise<ExtractedPdfResult> {
  // Check file size (max 10MB)
  const MAX_FILE_SIZE = 10 * 1024 * 1024;
  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error('PDF file size exceeds maximum allowed limit of 10MB.');
  }

  let text = '';
  let pageCount = 1;

  try {
    const pdfModule = require('pdf-parse');
    
    // Support pdf-parse v2 class structure
    if (pdfModule && pdfModule.PDFParse) {
      const parser = new pdfModule.PDFParse({ data: buffer });
      await parser.load();
      const textResult = await parser.getText();
      text = textResult.text || '';
      pageCount = textResult.total || parser.doc?.numPages || 1;
      await parser.destroy();
    } else if (typeof pdfModule === 'function') {
      // Support traditional pdf-parse v1 function
      const data = await pdfModule(buffer);
      text = data.text || '';
      pageCount = data.numpages || 1;
    } else if (pdfModule?.default && typeof pdfModule.default === 'function') {
      const data = await pdfModule.default(buffer);
      text = data.text || '';
      pageCount = data.numpages || 1;
    } else {
      throw new Error('Unable to initialize PDF parsing library');
    }
  } catch (err: any) {
    console.error('[PDF PARSE ERROR]', err);
    throw new Error(`Failed to parse PDF: ${err?.message || 'Invalid or corrupted PDF file'}`);
  }

  // Validate max 50 pages
  if (pageCount > 50) {
    throw new Error(`PDF exceeds maximum allowed page count of 50 pages (uploaded file has ${pageCount} pages). Please upload a study guide under 50 pages or paste text directly.`);
  }

  // Clean text
  const cleanText = text.replace(/\r\n/g, '\n').trim();

  // Validate minimum 500 characters
  if (cleanText.length < 500) {
    throw new Error('Extracted text from PDF is under 500 characters. Please paste your text instead.');
  }

  return {
    text: cleanText,
    pageCount
  };
}

/**
 * Splits large text into chunks with slight overlap.
 */
function chunkText(text: string, chunkSize = 12000, overlap = 800): string[] {
  if (text.length <= chunkSize) return [text];

  const chunks: string[] = [];
  let startIndex = 0;

  while (startIndex < text.length) {
    let endIndex = startIndex + chunkSize;
    if (endIndex >= text.length) {
      chunks.push(text.slice(startIndex));
      break;
    }

    // Try to find a paragraph break or newline near endIndex
    const sliceToSearch = text.slice(endIndex - 300, endIndex + 300);
    const nlIdx = sliceToSearch.lastIndexOf('\n\n');
    if (nlIdx !== -1) {
      endIndex = (endIndex - 300) + nlIdx;
    }

    chunks.push(text.slice(startIndex, endIndex));
    startIndex = Math.max(startIndex + 1, endIndex - overlap);
  }

  return chunks;
}

/**
 * Summarizes raw study guide text using DeepSeek once, or chunks and merges if text is long.
 */
export async function summarizeStudyGuide(rawText: string, committeeName?: string): Promise<StudyGuideSummary> {
  const clean = rawText.trim();
  if (clean.length < 200) {
    throw new Error('Study guide text is too short. Please provide at least 200 characters.');
  }

  const CHUNK_THRESHOLD = 14000;

  if (clean.length <= CHUNK_THRESHOLD) {
    // Single-pass summarization
    return await summarizeSingleChunk(clean, committeeName);
  }

  // Multi-pass chunking and merging for long texts
  const chunks = chunkText(clean, 12000, 800);
  // Limit to maximum 8 chunks to maintain performance and avoid quota starvation
  const limitedChunks = chunks.slice(0, 8);
  console.log(`[Study Guide] Text length ${clean.length} chars. Processing in ${limitedChunks.length} chunks...`);

  const partialSummaries: StudyGuideSummary[] = [];

  for (let i = 0; i < limitedChunks.length; i++) {
    const chunk = limitedChunks[i];
    try {
      console.log(`[Study Guide] Summarizing chunk ${i + 1}/${limitedChunks.length}...`);
      const partial = await summarizeSingleChunk(
        chunk,
        `${committeeName || 'Model UN Committee'} (Section ${i + 1} of ${limitedChunks.length})`
      );
      partialSummaries.push(partial);
    } catch (e) {
      console.warn(`[Study Guide] Chunk ${i + 1} summary error, continuing...`, e);
    }
  }

  if (partialSummaries.length === 0) {
    throw new Error('Failed to generate study guide summary from chunks.');
  }

  if (partialSummaries.length === 1) {
    return partialSummaries[0];
  }

  // Merge chunk summaries into a cohesive final JSON
  console.log(`[Study Guide] Merging ${partialSummaries.length} chunk summaries...`);
  return await mergeSummaries(partialSummaries, committeeName);
}

async function summarizeSingleChunk(text: string, contextName?: string): Promise<StudyGuideSummary> {
  const systemPrompt = `You are a Senior Model UN Academic Director and Committee Dais Researcher.
Analyze the following Model UN Committee Study Guide / Background Guide excerpt for ${contextName || 'the assigned committee'}.
Extract and synthesize a structured, academically rigorous summary in strictly valid JSON format matching this exact schema:
{
  "rules_of_procedure": "Detailed bullet points covering special committee rules, voting majorities (2/3 vs simple), speaking limits, caucus procedures, roll call rules, or parliamentary nuances mentioned.",
  "key_facts": "Essential background statistics, geopolitical realities, institutional mandates, definitions, and stakeholder positions.",
  "existing_laws_and_gaps": "Relevant international treaties, UN resolutions, bilateral accords, domestic statutes, and critical regulatory gaps or enforcement weaknesses.",
  "past_events": "Chronological milestones, historical flashpoints, previous military or diplomatic interventions, and key historical precedents.",
  "questions_to_answer": "Core questions, policy dilemmas, and questions a resolution must answer as posed or necessitated by the guide."
}

CRITICAL RULES:
- Output strictly valid JSON. Do not include markdown code block markers or introductory chit-chat.
- Fill all 5 fields with rich, factual, high-utility diplomatic details from the text. If a category is not explicitly mentioned, extrapolate reasonable committee-level implications or state 'Standard rules apply'.`;

  const userPrompt = `Study Guide Text:\n${text}`;

  const rawJson = await callDeepSeekOrFallback(systemPrompt, userPrompt, {
    jsonMode: true,
    temperature: 0.5,
    max_tokens: 2500
  });

  return parseSummaryJson(rawJson);
}

async function mergeSummaries(summaries: StudyGuideSummary[], committeeName?: string): Promise<StudyGuideSummary> {
  const systemPrompt = `You are a Chief Diplomatic Editor and UN Academic Director.
You are given multiple partial summaries extracted from different sections of a comprehensive Model UN Study Guide for ${committeeName || 'the committee'}.
Synthesize and consolidate them into a single, cohesive, authoritative, and non-redundant master summary in strictly valid JSON matching this exact schema:
{
  "rules_of_procedure": "Consolidated procedural nuances, caucus formats, and voting thresholds.",
  "key_facts": "Consolidated key facts, statistics, and geopolitical context.",
  "existing_laws_and_gaps": "Comprehensive list of treaties, conventions, existing UN resolutions, and legislative gaps.",
  "past_events": "Consolidated timeline of historical events and diplomatic precedents.",
  "questions_to_answer": "Consolidated list of core questions a resolution or position paper must address."
}

CRITICAL:
- Return strictly valid JSON.
- Synthesize repetitive points into clean, impactful bullet points.`;

  const userPrompt = `Partial Summaries to Merge:\n${JSON.stringify(summaries, null, 2)}`;

  const rawJson = await callDeepSeekOrFallback(systemPrompt, userPrompt, {
    jsonMode: true,
    temperature: 0.4,
    max_tokens: 3000
  });

  return parseSummaryJson(rawJson);
}

function parseSummaryJson(raw: string): StudyGuideSummary {
  try {
    let clean = raw.trim();
    // Strip markdown code fences if present
    if (clean.startsWith('```json')) {
      clean = clean.slice(7);
    } else if (clean.startsWith('```')) {
      clean = clean.slice(3);
    }
    if (clean.endsWith('```')) {
      clean = clean.slice(0, -3);
    }
    clean = clean.trim();

    const parsed = JSON.parse(clean);
    return {
      rules_of_procedure: parsed.rules_of_procedure || 'Standard Model UN Rules of Procedure apply.',
      key_facts: parsed.key_facts || 'Key facts extracted from committee briefing.',
      existing_laws_and_gaps: parsed.existing_laws_and_gaps || 'Relevant UN treaties and legal frameworks.',
      past_events: parsed.past_events || 'Historical precedents and timeline.',
      questions_to_answer: parsed.questions_to_answer || 'Key questions for resolution drafting.'
    };
  } catch (err) {
    console.error('[Study Guide JSON Parse Error]', err, 'Raw was:', raw);
    // Fallback extraction if JSON parsing failed
    return {
      rules_of_procedure: extractSection(raw, 'rules_of_procedure') || 'Standard parliamentary procedure applies.',
      key_facts: extractSection(raw, 'key_facts') || 'Essential background data from study guide.',
      existing_laws_and_gaps: extractSection(raw, 'existing_laws_and_gaps') || 'Relevant international conventions and treaties.',
      past_events: extractSection(raw, 'past_events') || 'Key historical milestones and previous accords.',
      questions_to_answer: extractSection(raw, 'questions_to_answer') || 'Questions to address in working paper.'
    };
  }
}

function extractSection(text: string, key: string): string {
  const regex = new RegExp(`"${key}"\\s*:\\s*"([^"]+)"`, 'i');
  const match = text.match(regex);
  return match ? match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"') : '';
}
