import React from 'react';

/**
 * Generic dynamic field editor for arrays (skills, education, certifications)
 */
const DynamicFieldEditor = ({ 
    title, 
    items = [], 
    onChange, 
    fieldTemplate, 
    renderItem,
    addButtonText = "Add",
    isEditing 
}) => {
    const handleAdd = () => {
        onChange([...items, { ...fieldTemplate }]);
    };

    const handleRemove = (index) => {
        const newItems = items.filter((_, i) => i !== index);
        onChange(newItems);
    };

    const handleChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        onChange(newItems);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white flex items-center">
                    <svg className="w-5 h-5 mr-2 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    {title}
                </h3>
                {isEditing && (
                    <button
                        type="button"
                        onClick={handleAdd}
                        className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 border border-cyan-500/30 transition-all text-sm flex items-center space-x-1"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>{addButtonText}</span>
                    </button>
                )}
            </div>

            {items.length === 0 ? (
                <div className="text-center py-8 bg-slate-800/30 border border-slate-700 rounded-lg">
                    <svg className="w-12 h-12 text-gray-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="text-gray-400 text-sm">No {title.toLowerCase()} added yet</p>
                    {isEditing && (
                        <button
                            type="button"
                            onClick={handleAdd}
                            className="mt-3 text-cyan-400 hover:text-cyan-300 text-sm font-medium"
                        >
                            + Add your first {title.toLowerCase().replace(/s$/, '')}
                        </button>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    {items.map((item, index) => (
                        <div
                            key={index}
                            className="bg-slate-800/30 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-all"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    {renderItem(item, index, handleChange, isEditing)}
                                </div>
                                {isEditing && (
                                    <button
                                        type="button"
                                        onClick={() => handleRemove(index)}
                                        className="ml-2 text-red-400 hover:text-red-300 transition-colors"
                                        title="Remove"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DynamicFieldEditor;
