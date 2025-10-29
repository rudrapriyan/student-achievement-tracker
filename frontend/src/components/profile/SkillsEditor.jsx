import React from 'react';
import DynamicFieldEditor from './DynamicFieldEditor';

const SkillsEditor = ({ skills, onChange, isEditing }) => {
    const fieldTemplate = {
        name: '',
        category: 'technical',
        proficiency: 'intermediate'
    };

    const renderSkill = (skill, index, handleChange, isEditing) => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
                <label className="block text-xs text-gray-400 mb-1">Skill Name *</label>
                {isEditing ? (
                    <input
                        type="text"
                        value={skill.name || ''}
                        onChange={(e) => handleChange(index, 'name', e.target.value)}
                        placeholder="e.g., React, Python, Leadership"
                        className="w-full bg-slate-700 text-white p-2 rounded-lg border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none text-sm"
                    />
                ) : (
                    <p className="text-white font-medium">{skill.name || '—'}</p>
                )}
            </div>
            <div>
                <label className="block text-xs text-gray-400 mb-1">Category</label>
                {isEditing ? (
                    <select
                        value={skill.category || 'technical'}
                        onChange={(e) => handleChange(index, 'category', e.target.value)}
                        className="w-full bg-slate-700 text-white p-2 rounded-lg border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none text-sm"
                    >
                        <option value="technical">Technical</option>
                        <option value="soft">Soft Skills</option>
                        <option value="tools">Tools & Software</option>
                        <option value="languages">Programming Languages</option>
                        <option value="other">Other</option>
                    </select>
                ) : (
                    <p className="text-gray-300 capitalize">{skill.category || '—'}</p>
                )}
            </div>
            <div>
                <label className="block text-xs text-gray-400 mb-1">Proficiency</label>
                {isEditing ? (
                    <select
                        value={skill.proficiency || 'intermediate'}
                        onChange={(e) => handleChange(index, 'proficiency', e.target.value)}
                        className="w-full bg-slate-700 text-white p-2 rounded-lg border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none text-sm"
                    >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                        <option value="expert">Expert</option>
                    </select>
                ) : (
                    <div className="flex items-center">
                        <div className="flex-1 bg-slate-700 rounded-full h-2 mr-2">
                            <div 
                                className={`h-2 rounded-full ${
                                    skill.proficiency === 'expert' ? 'w-full bg-green-500' :
                                    skill.proficiency === 'advanced' ? 'w-3/4 bg-cyan-500' :
                                    skill.proficiency === 'intermediate' ? 'w-1/2 bg-blue-500' :
                                    'w-1/4 bg-yellow-500'
                                }`}
                            />
                        </div>
                        <span className="text-xs text-gray-400 capitalize">{skill.proficiency || 'intermediate'}</span>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <DynamicFieldEditor
            title="Skills"
            items={skills}
            onChange={onChange}
            fieldTemplate={fieldTemplate}
            renderItem={renderSkill}
            addButtonText="Add Skill"
            isEditing={isEditing}
        />
    );
};

export default SkillsEditor;
