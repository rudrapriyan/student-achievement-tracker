import React from 'react';
import DynamicFieldEditor from './DynamicFieldEditor';

const CertificationsEditor = ({ certifications, onChange, isEditing }) => {
    const fieldTemplate = {
        name: '',
        issuer: '',
        date: '',
        credentialId: '',
        url: ''
    };

    const renderCertification = (cert, index, handleChange, isEditing) => (
        <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs text-gray-400 mb-1">Certification Name *</label>
                    {isEditing ? (
                        <input
                            type="text"
                            value={cert.name || ''}
                            onChange={(e) => handleChange(index, 'name', e.target.value)}
                            placeholder="e.g., AWS Certified Solutions Architect"
                            className="w-full bg-slate-700 text-white p-2 rounded-lg border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none text-sm"
                        />
                    ) : (
                        <p className="text-white font-medium">{cert.name || '—'}</p>
                    )}
                </div>
                <div>
                    <label className="block text-xs text-gray-400 mb-1">Issuing Organization *</label>
                    {isEditing ? (
                        <input
                            type="text"
                            value={cert.issuer || ''}
                            onChange={(e) => handleChange(index, 'issuer', e.target.value)}
                            placeholder="e.g., Amazon Web Services, Google, Microsoft"
                            className="w-full bg-slate-700 text-white p-2 rounded-lg border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none text-sm"
                        />
                    ) : (
                        <p className="text-gray-300">{cert.issuer || '—'}</p>
                    )}
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs text-gray-400 mb-1">Issue Date</label>
                    {isEditing ? (
                        <input
                            type="text"
                            value={cert.date || ''}
                            onChange={(e) => handleChange(index, 'date', e.target.value)}
                            placeholder="e.g., January 2024, 2024"
                            className="w-full bg-slate-700 text-white p-2 rounded-lg border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none text-sm"
                        />
                    ) : (
                        <p className="text-gray-300">{cert.date || '—'}</p>
                    )}
                </div>
                <div>
                    <label className="block text-xs text-gray-400 mb-1">Credential ID</label>
                    {isEditing ? (
                        <input
                            type="text"
                            value={cert.credentialId || ''}
                            onChange={(e) => handleChange(index, 'credentialId', e.target.value)}
                            placeholder="e.g., ABC123XYZ"
                            className="w-full bg-slate-700 text-white p-2 rounded-lg border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none text-sm"
                        />
                    ) : (
                        <p className="text-gray-300 font-mono text-xs">{cert.credentialId || '—'}</p>
                    )}
                </div>
            </div>
            <div>
                <label className="block text-xs text-gray-400 mb-1">Verification URL</label>
                {isEditing ? (
                    <input
                        type="url"
                        value={cert.url || ''}
                        onChange={(e) => handleChange(index, 'url', e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-slate-700 text-white p-2 rounded-lg border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none text-sm"
                    />
                ) : (
                    cert.url ? (
                        <a 
                            href={cert.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center space-x-1"
                        >
                            <span>View Certificate</span>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </a>
                    ) : (
                        <p className="text-gray-500 text-sm">—</p>
                    )
                )}
            </div>
        </div>
    );

    return (
        <DynamicFieldEditor
            title="Certifications"
            items={certifications}
            onChange={onChange}
            fieldTemplate={fieldTemplate}
            renderItem={renderCertification}
            addButtonText="Add Certification"
            isEditing={isEditing}
        />
    );
};

export default CertificationsEditor;
