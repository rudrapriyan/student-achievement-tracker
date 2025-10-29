import React, { useState, useRef } from 'react';
import '../styles/resume.css';
import { Icon } from './Icon';
import { Spinner } from './Spinner';
import { ResumeRenderer } from './ResumeRenderer';
import BackButton from './BackButton';

const ResumeGenerator = ({ token, toast, setIsLoading, isLoading, setView }) => {
    // Get roll number and name from JWT token
    const [tokenData, setTokenData] = useState(() => {
        try {
            const tokenPayload = JSON.parse(atob(token.split('.')[1]));
            return {
                rollNumber: tokenPayload.rollNumber || '',
                name: tokenPayload.name || ''
            };
        } catch (e) {
            return { rollNumber: '', name: '' };
        }
    });
    
    const [rollNumber] = useState(tokenData.rollNumber);
    const [showNameModal, setShowNameModal] = useState(!tokenData.name);
    const [tempName, setTempName] = useState('');
    const [generatedResume, setGeneratedResume] = useState('');
    const [showPreview, setShowPreview] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    // Function to update name permanently
    const updateName = async (name) => {
        try {
            const response = await fetch('http://localhost:3000/api/profile/update-name', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            // Update token and name in local state
            setTokenData(prev => ({ ...prev, name: data.name }));
            setShowNameModal(false);
            toast.success('Name updated successfully!');

            // Update the token in parent component
            if (data.token) {
                localStorage.setItem('token', data.token);
                window.location.reload(); // Refresh to update token everywhere
            }
        } catch (err) {
            toast.error(err.message);
        }
    };

    const resumeRef = useRef(null);

    const createPdfFromNode = async (node, filename = 'resume.pdf') => {
        if (!node) return;
        if (typeof window.html2canvas === 'undefined' || typeof window.jspdf === 'undefined') {
            // jsPDF UMD exposes window.jspdf (with .jsPDF)
            if (typeof window.html2canvas === 'undefined') throw new Error('html2canvas is not available.');
            if (typeof window.jspdf === 'undefined') throw new Error('jsPDF is not available.');
        }

        // Apply a simplified style during capture to avoid shadows/rounding affecting size
        node.classList.add('pdf-mode');
        let canvas;
        try {
            // Render to canvas with controlled scale for better quality and single-page fit
            const scale = 2;
            canvas = await window.html2canvas(node, {
                scale,
                useCORS: true,
                backgroundColor: '#ffffff',
                windowWidth: 794, // A4 width at 96 DPI
                windowHeight: 1123, // A4 height at 96 DPI
                logging: false
            });
        } finally {
            node.classList.remove('pdf-mode');
        }
        const imgData = canvas.toDataURL('image/png');

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'pt', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfMaxHeight = pdf.internal.pageSize.getHeight();
        let pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        // Force single page by scaling down if content is too tall
        let finalWidth = pdfWidth;
        let finalHeight = pdfHeight;
        
        if (pdfHeight > pdfMaxHeight) {
            // Scale down to fit on one page
            const scaleFactor = pdfMaxHeight / pdfHeight;
            finalWidth = pdfWidth * scaleFactor;
            finalHeight = pdfMaxHeight;
            // Center horizontally
            const xOffset = (pdfWidth - finalWidth) / 2;
            pdf.addImage(imgData, 'PNG', xOffset, 0, finalWidth, finalHeight);
        } else {
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        }
        
        pdf.save(filename);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!rollNumber) {
            toast.error('Please enter your roll number');
            return;
        }

        setIsGenerating(true);
        setGeneratedResume('');
        setShowPreview(false);

        try {
            console.log('Sending resume generation request for:', rollNumber);
            if (!tokenData.name) {
                throw new Error('Please set your name before generating a resume');
            }

            const response = await fetch('http://localhost:3000/api/resume/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    rollNumber,
                    studentName: tokenData.name 
                })
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('Resume generation failed:', data);
                throw new Error(data.message || data.details || 'Failed to generate resume.');
            }

            setGeneratedResume(data);
            setShowPreview(true);
            toast.success('Resume generated successfully!');

        } catch (err) {
            toast.error(err.message);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownloadPdf = async () => {
        try {
            const node = resumeRef.current;
            if (!node) {
                toast.error('No resume to download');
                return;
            }
            toast.info('Preparing PDF download...');
            await createPdfFromNode(node, `${rollNumber || 'resume'}.pdf`);
            toast.success('PDF downloaded successfully!');
        } catch (err) {
            toast.error('Failed to create PDF: ' + (err?.message || err));
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Back Button */}
            <div className="mb-6">
                <BackButton onClick={() => setView('dashboard')} label="Back to Dashboard" />
            </div>

            {/* Generation Form */}
            {!showPreview && (
                <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-xl shadow-2xl shadow-black/20 max-w-3xl mx-auto backdrop-blur-sm">
                    <h2 className="text-3xl font-bold mb-1 text-center text-white">Generate ATS-Friendly Resume</h2>
                    <p className="text-gray-400 text-center mb-8">Create a professional resume from your validated achievements</p>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            {/* Roll Number Display */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Roll Number</label>
                                <input 
                                    type="text"
                                    value={rollNumber}
                                    readOnly
                                    className="w-full bg-slate-800/50 text-gray-200 p-3 rounded-lg border border-slate-700 opacity-75 cursor-not-allowed"
                                />
                            </div>

                            {/* Name Display */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                                <input 
                                    type="text"
                                    value={tokenData.name}
                                    readOnly
                                    className="w-full bg-slate-800/50 text-gray-200 p-3 rounded-lg border border-slate-700 opacity-75 cursor-not-allowed"
                                />
                            </div>

                            {/* Name Modal */}
                            {showNameModal && (
                                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
                                    <div className="bg-slate-800 p-8 rounded-xl shadow-2xl max-w-md w-full mx-4 border border-slate-700">
                                        <h3 className="text-2xl font-bold text-white mb-4">Enter Your Name</h3>
                                        <p className="text-gray-300 mb-6">
                                            Please enter your full name as you want it to appear on your resume.
                                        </p>
                                        <form onSubmit={(e) => {
                                            e.preventDefault();
                                            if (tempName.trim()) updateName(tempName);
                                        }} className="space-y-4">
                                            <input 
                                                type="text"
                                                value={tempName}
                                                onChange={(e) => setTempName(e.target.value)}
                                                placeholder="Full Name (e.g., John Doe)"
                                                className="w-full bg-slate-700 text-white p-3 rounded-lg border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                                                required
                                            />
                                            <button
                                                type="submit"
                                                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:from-cyan-400 hover:to-blue-500 transition-all"
                                            >
                                                Save Name
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <button
                            type="submit"
                            disabled={isGenerating}
                            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-4 px-10 rounded-lg hover:from-cyan-400 hover:to-blue-500 disabled:from-gray-500 disabled:to-gray-600 transition-all duration-300 flex items-center justify-center shadow-lg"
                        >
                            {isGenerating ? (
                                <>
                                    <div className="animate-spin rounded-full border-b-2 border-white h-5 w-5 mr-2"></div>
                                    <span>Generating Resume...</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Generate Resume
                                </>
                            )}
                        </button>
                    </form>
                </div>
            )}

            {/* Resume Preview */}
            {showPreview && generatedResume && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-3xl font-bold text-white">Resume Preview</h2>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setShowPreview(false)}
                                className="px-4 py-2 bg-slate-700 text-gray-300 rounded-lg hover:bg-slate-600 transition-all"
                            >
                                Generate New
                            </button>
                            <button
                                onClick={handleDownloadPdf}
                                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-400 hover:to-emerald-500 transition-all shadow-lg"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                <span>Download PDF</span>
                            </button>
                        </div>
                    </div>

                    {/* Preview Container */}
                    <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-8 shadow-2xl">
                        <div className="bg-white rounded-lg shadow-2xl overflow-hidden mx-auto" style={{ maxWidth: '210mm' }}>
                            <div ref={resumeRef} id="resume-to-pdf" className="resume-container">
                                <ResumeRenderer resume={generatedResume} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResumeGenerator;