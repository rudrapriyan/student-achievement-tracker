import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../api';
import { Spinner, Icon } from './UI';
import html2pdf from 'html2pdf.js';

const ResumeBuilder = () => {
    const { token } = useAuth();
    const [resumeData, setResumeData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const resumeRef = useRef();

    const generateResume = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_BASE_URL}/resume/generate`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to generate resume.');
            const data = await response.json();
            setResumeData(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const downloadPDF = () => {
        const element = resumeRef.current;
        const opt = {
            margin: 0,
            filename: `Resume_${resumeData.personalInfo.name.replace(/\s+/g, '_')}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(element).save();
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-900/50 p-6 rounded-xl border border-slate-700/50">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Smart Resume Generator</h2>
                    <p className="text-gray-400">Turn your profile and achievements into a professional resume with AI.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={generateResume}
                        disabled={loading}
                        className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading ? <Spinner size="w-5 h-5" /> : <Icon path="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" className="w-5 h-5" />}
                        {loading ? 'Generating...' : 'Generate with AI'}
                    </button>
                    {resumeData && (
                        <button
                            onClick={downloadPDF}
                            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl border border-slate-600 transition-all flex items-center gap-2"
                        >
                            <Icon path="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" className="w-5 h-5" />
                            Download PDF
                        </button>
                    )}
                </div>
            </div>

            {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-center">{error}</div>}

            {resumeData && (
                <div className="flex justify-center overflow-x-auto py-8 bg-slate-800/30 rounded-xl">
                    {/* A4 Resume Container - LaTeX Style */}
                    <div
                        ref={resumeRef}
                        className="bg-white text-slate-900 shadow-2xl font-serif"
                        style={{
                            width: '210mm',
                            minHeight: '297mm',
                            padding: '20mm',
                            boxSizing: 'border-box',
                            fontSize: '11pt',
                            lineHeight: '1.4'
                        }}
                    >
                        {/* Header */}
                        <div className="text-center mb-6">
                            <h1 className="text-4xl font-normal mb-2 tracking-wide text-black">{resumeData.personalInfo.name}</h1>
                            <div className="text-sm flex flex-wrap justify-center gap-x-4 gap-y-1 text-slate-800">
                                {resumeData.personalInfo.location && (
                                    <span><span className="font-bold">Location:</span> {resumeData.personalInfo.location}</span>
                                )}
                                {resumeData.personalInfo.email && (
                                    <span><span className="font-bold">Email:</span> <a href={`mailto:${resumeData.personalInfo.email}`} className="text-blue-700 hover:underline">{resumeData.personalInfo.email}</a></span>
                                )}
                                {resumeData.personalInfo.phone && (
                                    <span><span className="font-bold">Phone:</span> {resumeData.personalInfo.phone}</span>
                                )}
                            </div>
                            <div className="text-sm flex flex-wrap justify-center gap-x-4 gap-y-1 mt-1 text-slate-800">
                                {resumeData.personalInfo.linkedin && (
                                    <span><span className="font-bold">LinkedIn:</span> <a href={resumeData.personalInfo.linkedin} target="_blank" rel="noreferrer" className="text-blue-700 hover:underline">{resumeData.personalInfo.linkedin.replace(/^https?:\/\/(www\.)?/, '')}</a></span>
                                )}
                                {resumeData.personalInfo.github && (
                                    <span><span className="font-bold">GitHub:</span> <a href={resumeData.personalInfo.github} target="_blank" rel="noreferrer" className="text-blue-700 hover:underline">{resumeData.personalInfo.github.replace(/^https?:\/\/(www\.)?/, '')}</a></span>
                                )}
                            </div>
                        </div>

                        {/* Education */}
                        {resumeData.education && resumeData.education.length > 0 && (
                            <div className="mb-4">
                                <h3 className="text-lg font-bold uppercase border-b border-black mb-2 pb-0.5 text-black">Education</h3>
                                <div className="space-y-3">
                                    {resumeData.education.map((edu, index) => (
                                        <div key={index}>
                                            <div className="flex justify-between items-baseline">
                                                <h4 className="font-bold text-black text-base">{edu.institution}</h4>
                                                <span className="text-sm font-medium italic">{edu.year}</span>
                                            </div>
                                            <div className="flex justify-between items-baseline">
                                                <div className="italic text-slate-800">{edu.degree}</div>
                                                {/* Placeholder for Grade if available in future */}
                                            </div>
                                            {edu.details && (
                                                <ul className="list-disc list-outside ml-5 text-sm text-slate-800 mt-1">
                                                    <li>{edu.details}</li>
                                                </ul>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Skills (Mapped to Technologies/Languages style) */}
                        {resumeData.skills && resumeData.skills.length > 0 && (
                            <div className="mb-4">
                                <h3 className="text-lg font-bold uppercase border-b border-black mb-2 pb-0.5 text-black">Technologies & Skills</h3>
                                <div className="text-sm text-slate-800">
                                    <span className="font-bold">Skills: </span>
                                    {resumeData.skills.join(', ')}
                                </div>
                            </div>
                        )}

                        {/* Projects / Experience */}
                        {resumeData.experience && resumeData.experience.length > 0 && (
                            <div className="mb-4">
                                <h3 className="text-lg font-bold uppercase border-b border-black mb-2 pb-0.5 text-black">Projects</h3>
                                <div className="space-y-4">
                                    {resumeData.experience.map((exp, index) => (
                                        <div key={index}>
                                            <div className="flex justify-between items-baseline mb-1">
                                                <h4 className="font-bold text-black text-base">
                                                    {exp.title}
                                                    {exp.subtitle && <span className="font-normal text-slate-700 text-sm ml-1">| {exp.subtitle}</span>}
                                                </h4>
                                                <span className="text-sm font-medium italic">{exp.date}</span>
                                            </div>
                                            <ul className="list-disc list-outside ml-5 text-sm text-slate-800 space-y-0.5">
                                                {exp.description.map((bullet, i) => (
                                                    <li key={i}>{bullet}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Summary (Optional, at bottom or top depending on preference, putting at bottom for now or omitting if not in LaTeX style usually) */}
                        {/* LaTeX resumes often skip the summary or put it at top. Let's keep it simple and omit if not strictly requested, or put it at the top if it exists. 
                            Actually, the user's image didn't show a summary, but the data has it. I'll put it at the top if it exists, but make it subtle.
                        */}
                        {resumeData.summary && (
                            <div className="mb-4">
                                <h3 className="text-lg font-bold uppercase border-b border-black mb-2 pb-0.5 text-black">Summary</h3>
                                <p className="text-sm text-slate-800 text-justify">{resumeData.summary}</p>
                            </div>
                        )}

                    </div>
                </div>
            )}
        </div>
    );
};

export default ResumeBuilder;
