import React, { useState, useRef } from 'react';
import '../styles/resume.css';
import { Icon } from './Icon';
import { Spinner } from './Spinner';
import { ResumeRenderer } from './ResumeRenderer';

const ResumeGenerator = ({ token, setSuccessMessage, setError, setIsLoading, isLoading, setView }) => {
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
            setSuccessMessage('Name updated successfully!');

            // Update the token in parent component
            if (data.token) {
                localStorage.setItem('token', data.token);
                window.location.reload(); // Refresh to update token everywhere
            }
        } catch (err) {
            setError(err.message);
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

        // Render to canvas
        const canvas = await window.html2canvas(node, { scale: 2, useCORS: true });
        const imgData = canvas.toDataURL('image/png');

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'pt', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        // If content fits on one page, add and save
        if (pdfHeight <= pdf.internal.pageSize.getHeight()) {
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        } else {
            // Add the full image scaled to width and allow vertical overflow across pages
            let remainingHeight = canvas.height;
            const pageHeightPx = (canvas.width * pdf.internal.pageSize.getHeight()) / pdfWidth; // px height per pdf page
            let position = 0;
            const ratio = pdfWidth / canvas.width;

            while (remainingHeight > 0) {
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = canvas.width;
                tempCanvas.height = Math.min(pageHeightPx, remainingHeight);
                const ctx = tempCanvas.getContext('2d');
                ctx.drawImage(canvas, 0, position, canvas.width, tempCanvas.height, 0, 0, canvas.width, tempCanvas.height);
                const chunkData = tempCanvas.toDataURL('image/png');
                const chunkHeightPdf = (tempCanvas.height * ratio);
                pdf.addImage(chunkData, 'PNG', 0, 0, pdfWidth, chunkHeightPdf);
                remainingHeight -= tempCanvas.height;
                position += tempCanvas.height;
                if (remainingHeight > 0) pdf.addPage();
            }
        }

        pdf.save(filename);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!rollNumber) {
            setError('Please enter your roll number');
            return;
        }

        // Log the token payload for debugging
        try {
            const tokenPayload = JSON.parse(atob(token.split('.')[1]));
            console.log('Token payload:', tokenPayload);
        } catch (e) {
            console.error('Failed to decode token:', e);
        }

        setIsLoading(true);
        setError('');
        setGeneratedResume('');

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
            setSuccessMessage('Resume generated successfully!');

            // Give React a moment to render the markdown, then generate PDF and prompt download
            // Use requestAnimationFrame twice to allow DOM update
            requestAnimationFrame(() => requestAnimationFrame(async () => {
                try {
                    const node = resumeRef.current;
                    await createPdfFromNode(node, `${rollNumber || 'resume'}.pdf`);
                } catch (err) {
                    // don't block user flow; show an error
                    setError('Failed to create PDF: ' + (err && err.message ? err.message : err));
                }
            }));

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-xl shadow-2xl shadow-black/20 max-w-3xl mx-auto backdrop-blur-sm animate-fade-in">
            <h2 className="text-3xl font-bold mb-1 text-center text-white">Generate Full Resume</h2>
            <p className="text-gray-400 text-center mb-8">Enter your Roll Number to generate a full resume from your validated achievements.</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    {/* Roll Number Display */}
                    <div className="flex items-center gap-3">
                        <input 
                            type="text"
                            value={rollNumber}
                            readOnly
                            placeholder="Roll Number"
                            className="w-full bg-slate-800/50 text-gray-200 p-3 rounded-lg border border-slate-700 opacity-75 cursor-not-allowed"
                        />
                        <div className="text-gray-400 text-sm">
                            <Icon path="M12 6v6m0 0v6m0-6h6m-6 0H6" className="w-5 h-5 opacity-50" />
                        </div>
                    </div>

                    {/* Name Modal */}
                    {showNameModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-slate-800 p-8 rounded-xl shadow-2xl max-w-md w-full mx-4">
                                <h3 className="text-2xl font-bold text-white mb-4">Enter Your Name</h3>
                                <p className="text-gray-300 mb-6">
                                    Please enter your full name as you want it to appear on your resume. 
                                    This will be saved and used for all future resumes.
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
                                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:from-cyan-400 hover:to-blue-500"
                                    >
                                        Save Name
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 px-10 rounded-full hover:from-cyan-400 hover:to-blue-500 disabled:from-gray-500 disabled:to-gray-600 transition-all duration-300 flex items-center justify-center shadow-lg shadow-cyan-500/20 hover:shadow-cyan-400/30 transform hover:scale-105"
                    >
                        {isLoading ? <Spinner /> : (
                            <span className="flex items-center">
                                Generate Resume
                                <Icon path="M12 4.5v15m7.5-7.5h-15" className="w-5 h-5 ml-2" />
                            </span>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => setView('student')}
                        className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold py-3 px-10 rounded-full hover:from-purple-400 hover:to-indigo-500 transition-all duration-300 flex items-center justify-center shadow-lg shadow-purple-500/20 hover:shadow-purple-400/30 transform hover:scale-105"
                    >
                        <span className="flex items-center">
                            Add More Achievements
                            <Icon path="M19 11H13V5a1 1 0 00-2 0v6H5a1 1 0 000 2h6v6a1 1 0 002 0v-6h6a1 1 0 000-2z" className="w-5 h-5 ml-2" />
                        </span>
                    </button>
                </div>
            </form>

            {generatedResume && (
                <div className="mt-8 pt-6 border-t border-slate-700">
                    <h3 className="text-lg font-semibold text-cyan-400 mb-4">Your Generated Resume:</h3>
                    <div className="resume-container" ref={resumeRef} id="resume-to-pdf">
                        <ResumeRenderer resume={generatedResume} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResumeGenerator;