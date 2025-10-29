import React from 'react';
import DynamicFieldEditor from './DynamicFieldEditor';

const EducationEditor = ({ education, onChange, isEditing }) => {
    const fieldTemplate = {
        degree: '',
        institution: '',
        startYear: '',
        endYear: '',
        gpa: '',
        major: ''
    };

    const renderEducation = (edu, index, handleChange, isEditing) => (
        <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs text-gray-400 mb-1">Degree *</label>
                    {isEditing ? (
                        <input
                            type="text"
                            value={edu.degree || ''}
                            onChange={(e) => handleChange(index, 'degree', e.target.value)}
                            placeholder="e.g., B.Tech, M.Sc, B.A."
                            className="w-full bg-slate-700 text-white p-2 rounded-lg border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none text-sm"
                        />
                    ) : (
                        <p className="text-white font-medium">{edu.degree || '—'}</p>
                    )}
                </div>
                <div>
                    <label className="block text-xs text-gray-400 mb-1">Major/Specialization</label>
                    {isEditing ? (
                        <input
                            type="text"
                            value={edu.major || ''}
                            onChange={(e) => handleChange(index, 'major', e.target.value)}
                            placeholder="e.g., Computer Science, Mathematics"
                            className="w-full bg-slate-700 text-white p-2 rounded-lg border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none text-sm"
                        />
                    ) : (
                        <p className="text-gray-300">{edu.major || '—'}</p>
                    )}
                </div>
            </div>
            <div>
                <label className="block text-xs text-gray-400 mb-1">Institution *</label>
                {isEditing ? (
                    <input
                        type="text"
                        value={edu.institution || ''}
                        onChange={(e) => handleChange(index, 'institution', e.target.value)}
                        placeholder="e.g., MIT, Stanford University"
                        className="w-full bg-slate-700 text-white p-2 rounded-lg border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none text-sm"
                    />
                ) : (
                    <p className="text-gray-300">{edu.institution || '—'}</p>
                )}
            </div>
            <div className="grid grid-cols-3 gap-3">
                <div>
                    <label className="block text-xs text-gray-400 mb-1">Start Year</label>
                    {isEditing ? (
                        <input
                            type="text"
                            value={edu.startYear || ''}
                            onChange={(e) => handleChange(index, 'startYear', e.target.value)}
                            placeholder="2021"
                            className="w-full bg-slate-700 text-white p-2 rounded-lg border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none text-sm"
                        />
                    ) : (
                        <p className="text-gray-300">{edu.startYear || '—'}</p>
                    )}
                </div>
                <div>
                    <label className="block text-xs text-gray-400 mb-1">End Year</label>
                    {isEditing ? (
                        <input
                            type="text"
                            value={edu.endYear || ''}
                            onChange={(e) => handleChange(index, 'endYear', e.target.value)}
                            placeholder="2025"
                            className="w-full bg-slate-700 text-white p-2 rounded-lg border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none text-sm"
                        />
                    ) : (
                        <p className="text-gray-300">{edu.endYear || '—'}</p>
                    )}
                </div>
                <div>
                    <label className="block text-xs text-gray-400 mb-1">GPA/Percentage</label>
                    {isEditing ? (
                        <input
                            type="text"
                            value={edu.gpa || ''}
                            onChange={(e) => handleChange(index, 'gpa', e.target.value)}
                            placeholder="8.5/10 or 85%"
                            className="w-full bg-slate-700 text-white p-2 rounded-lg border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none text-sm"
                        />
                    ) : (
                        <p className="text-gray-300">{edu.gpa || '—'}</p>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <DynamicFieldEditor
            title="Education"
            items={education}
            onChange={onChange}
            fieldTemplate={fieldTemplate}
            renderItem={renderEducation}
            addButtonText="Add Education"
            isEditing={isEditing}
        />
    );
};

export default EducationEditor;
