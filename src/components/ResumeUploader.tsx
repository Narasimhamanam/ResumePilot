import React, { useRef, useState } from 'react';
import { Upload, FileType, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { extractTextFromFile } from '../services/fileParser';
import { getAIService } from '../services/aiService';
import { useToast } from '../context/ToastContext';
import { StructuredResume } from '../types';

interface ResumeUploaderProps {
  onParsed: (structured: StructuredResume, rawText: string, fileName: string) => void;
}

export const ResumeUploader: React.FC<ResumeUploaderProps> = ({ onParsed }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFile = async (file: File) => {
    // Security & format checks
    const extension = file.name.split('.').pop()?.toLowerCase();
    const validExtensions = ['pdf', 'docx', 'txt'];

    if (!extension || !validExtensions.includes(extension)) {
      toast({
        type: 'error',
        title: 'Unsupported File Format',
        description: 'Please upload a PDF (.pdf), Word (.docx), or plain text (.txt) file.',
      });
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      toast({
        type: 'error',
        title: 'File Too Large',
        description: 'Resume file size limit is 8MB.',
      });
      return;
    }

    setIsProcessing(true);
    setStatusText('Extracting text content from document...');

    try {
      const rawText = await extractTextFromFile(file);

      if (!rawText || rawText.trim().length < 50) {
        throw new Error('Document contains insufficient readable text. Please check the file formatting.');
      }

      setStatusText('Parsing sections into structured profile via Gemini AI...');
      const ai = getAIService();
      const structured = await ai.parseResume(rawText);

      toast({
        type: 'success',
        title: 'Resume Parsed Successfully',
        description: `Extracted ${structured.skills.length} skills and ${structured.experience.length} experience roles.`,
      });

      onParsed(structured, rawText, file.name);
    } catch (err: any) {
      console.error('File parsing failed:', err);
      toast({
        type: 'error',
        title: 'Resume Parsing Failed',
        description: err.message || 'Unable to extract structured data from this document.',
      });
    } finally {
      setIsProcessing(false);
      setStatusText('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full">
      <div
        id="resume-dropzone"
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50/50'
            : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-slate-50'
        } ${isProcessing ? 'pointer-events-none opacity-85' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFile(e.target.files[0]);
            }
          }}
        />

        <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 shadow-xs">
          {isProcessing ? (
            <Loader2 className="w-7 h-7 animate-spin" />
          ) : (
            <Upload className="w-7 h-7" />
          )}
        </div>

        <h4 className="text-base font-bold text-slate-800 mb-1">
          {isProcessing ? 'Processing Resume...' : 'Drop your resume here, or browse files'}
        </h4>

        <p className="text-xs text-slate-500 max-w-sm mb-4">
          {isProcessing
            ? statusText
            : 'Accepts PDF, Word (.docx), or plain text (.txt). Max file size 8MB.'}
        </p>

        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1 font-medium bg-white px-2.5 py-1 rounded-lg border border-slate-200">
            <FileType className="w-3.5 h-3.5 text-rose-500" /> PDF
          </span>
          <span className="flex items-center gap-1 font-medium bg-white px-2.5 py-1 rounded-lg border border-slate-200">
            <FileType className="w-3.5 h-3.5 text-blue-500" /> DOCX
          </span>
          <span className="flex items-center gap-1 font-medium bg-white px-2.5 py-1 rounded-lg border border-slate-200">
            <FileType className="w-3.5 h-3.5 text-slate-500" /> TXT
          </span>
        </div>
      </div>
    </div>
  );
};
