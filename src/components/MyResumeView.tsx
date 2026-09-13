import React, { useState } from 'react';
import { ResumeVersion, StructuredResume } from '../types';
import { ResumeUploader } from './ResumeUploader';
import {
  Plus,
  Copy,
  Trash2,
  Edit2,
  FileDown,
  Check,
  Sparkles,
  Award,
  BookOpen,
  Briefcase,
  Code2,
  ExternalLink,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface MyResumeViewProps {
  resumes: ResumeVersion[];
  selectedResumeId: string;
  onSelectResume: (id: string) => void;
  onSaveNewResume: (structured: StructuredResume, rawText: string, title: string) => Promise<void>;
  onDuplicateResume: (resume: ResumeVersion) => Promise<void>;
  onDeleteResume: (id: string) => Promise<void>;
  onUpdateResume: (resume: ResumeVersion) => Promise<void>;
}

export const MyResumeView: React.FC<MyResumeViewProps> = ({
  resumes,
  selectedResumeId,
  onSelectResume,
  onSaveNewResume,
  onDuplicateResume,
  onDeleteResume,
  onUpdateResume,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const { toast } = useToast();

  const currentResume = resumes.find((r) => r.id === selectedResumeId) || resumes[0];

  const handleDownloadTxt = () => {
    if (!currentResume) return;
    const jsonStr = JSON.stringify(currentResume.structuredData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentResume.title.replace(/\s+/g, '_')}_Structured.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      type: 'success',
      title: 'Resume Exported',
      description: 'Structured resume JSON exported successfully.',
    });
  };

  const handleRename = async () => {
    if (!currentResume || !newTitle.trim()) return;
    await onUpdateResume({
      ...currentResume,
      title: newTitle.trim(),
      updatedAt: new Date().toISOString(),
    });
    setEditingTitle(false);
    toast({
      type: 'success',
      title: 'Resume Renamed',
      description: `Resume title updated to "${newTitle.trim()}".`,
    });
  };

  return (
    <div id="my-resume-view" className="space-y-6 pb-12">
      {/* Top Header & Version Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Resume Version Management</h2>
          <p className="text-xs text-slate-500 mt-1">
            Maintain specialized resume profiles for frontend, backend, AI/ML, and general applications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="open-upload-modal-btn"
            onClick={() => setIsUploading(!isUploading)}
            className="px-3.5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            {isUploading ? 'Hide Uploader' : 'Upload New Resume'}
          </button>
        </div>
      </div>

      {/* Uploader Accordion */}
      {isUploading && (
        <div className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-sm animate-in fade-in duration-200">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-800">Upload & Parse Document</h3>
            <p className="text-xs text-slate-500">
              Extracts sections, verifies factual data, and creates a new resume version in your database.
            </p>
          </div>
          <ResumeUploader
            onParsed={async (structured, rawText, fileName) => {
              const baseName = fileName.replace(/\.[^/.]+$/, '');
              await onSaveNewResume(structured, rawText, `${baseName} (Parsed)`);
              setIsUploading(false);
            }}
          />
        </div>
      )}

      {/* Version Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        {resumes.map((res) => {
          const isSelected = res.id === currentResume?.id;
          return (
            <button
              key={res.id}
              onClick={() => onSelectResume(res.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-2 ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>{res.title}</span>
              {res.score && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                    isSelected ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {res.score.overall}%
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Resume Content */}
      {currentResume ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          {/* Resume Header Details */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-3">
                {editingTitle ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="text-base font-bold text-slate-900 border border-slate-300 rounded px-2 py-1"
                    />
                    <button
                      onClick={handleRename}
                      className="p-1.5 bg-emerald-600 text-white rounded text-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900">{currentResume.title}</h3>
                    <button
                      onClick={() => {
                        setNewTitle(currentResume.title);
                        setEditingTitle(true);
                      }}
                      className="text-slate-400 hover:text-slate-600 p-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Last modified: {new Date(currentResume.updatedAt).toLocaleDateString()} • Candidate:{' '}
                <span className="font-semibold text-slate-700">{currentResume.structuredData.name}</span>
              </p>
            </div>

            {/* Version Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => onDuplicateResume(currentResume)}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl transition flex items-center gap-1"
              >
                <Copy className="w-3 h-3 text-slate-500" />
                Duplicate
              </button>

              <button
                onClick={handleDownloadTxt}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl transition flex items-center gap-1"
              >
                <FileDown className="w-3 h-3 text-slate-500" />
                Download JSON / Text
              </button>

              {resumes.length > 1 && (
                <button
                  onClick={() => onDeleteResume(currentResume.id)}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </button>
              )}
            </div>
          </div>

          {/* Contact Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs bg-slate-50/70 p-4 rounded-xl border border-slate-100">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Email</span>
              <div className="font-medium text-slate-800 truncate mt-0.5">
                {currentResume.structuredData.email || 'Not specified'}
              </div>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Phone</span>
              <div className="font-medium text-slate-800 truncate mt-0.5">
                {currentResume.structuredData.phone || 'Not specified'}
              </div>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Location</span>
              <div className="font-medium text-slate-800 truncate mt-0.5">
                {currentResume.structuredData.location || 'Not specified'}
              </div>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">LinkedIn / Links</span>
              <div className="font-medium text-slate-800 truncate mt-0.5">
                {currentResume.structuredData.linkedIn || 'Not specified'}
              </div>
            </div>
          </div>

          {/* Professional Summary */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Professional Summary
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed bg-white border border-slate-200 p-4 rounded-xl">
              {currentResume.structuredData.professionalSummary || 'No professional summary extracted.'}
            </p>
          </div>

          {/* Extracted Skills */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Verified Skills ({currentResume.structuredData.skills?.length || 0})
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {currentResume.structuredData.skills?.map((skill, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg border border-slate-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Experience Timeline */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Work Experience ({currentResume.structuredData.experience?.length || 0})
            </h4>
            <div className="space-y-4">
              {currentResume.structuredData.experience?.map((exp, idx) => (
                <div key={idx} className="p-4 bg-slate-50/50 border border-slate-200 rounded-xl text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-900 text-sm">
                    <span>{exp.role}</span>
                    <span className="text-xs font-normal text-slate-500">
                      {exp.startDate} - {exp.endDate || 'Present'}
                    </span>
                  </div>
                  <div className="text-indigo-600 font-semibold mt-0.5">{exp.company}</div>
                  <ul className="list-disc pl-4 mt-2.5 space-y-1 text-slate-600">
                    {exp.bullets?.map((b, bi) => (
                      <li key={bi} className="leading-relaxed">
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Projects */}
          {currentResume.structuredData.projects && currentResume.structuredData.projects.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Projects ({currentResume.structuredData.projects.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentResume.structuredData.projects.map((proj, idx) => (
                  <div key={idx} className="p-4 bg-slate-50/50 border border-slate-200 rounded-xl text-xs">
                    <div className="font-bold text-slate-900 text-sm">{proj.title}</div>
                    <p className="text-slate-600 mt-1 leading-relaxed">{proj.description}</p>
                    {proj.technologies && proj.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2.5">
                        {proj.technologies.map((t, ti) => (
                          <span
                            key={ti}
                            className="text-[10px] px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-600 font-mono"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Education</h4>
            <div className="space-y-3">
              {currentResume.structuredData.education?.map((edu, idx) => (
                <div key={idx} className="p-3 bg-slate-50/50 border border-slate-200 rounded-xl text-xs">
                  <div className="font-bold text-slate-900">{edu.degree}</div>
                  <div className="text-slate-600">{edu.institution} {edu.year && `• ${edu.year}`}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl">
          <p className="text-sm text-slate-600 font-medium">No resumes currently uploaded.</p>
          <p className="text-xs text-slate-400 mt-1">Upload your PDF, Word DOCX, or TXT resume to begin.</p>
          <button
            onClick={() => setIsUploading(true)}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
          >
            Upload Resume
          </button>
        </div>
      )}
    </div>
  );
};
