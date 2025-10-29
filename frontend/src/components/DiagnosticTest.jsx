import React, { useState } from 'react';

const DiagnosticTest = ({ token }) => {
    const [results, setResults] = useState([]);

    const addResult = (test, status, message) => {
        setResults(prev => [...prev, { test, status, message, time: new Date().toLocaleTimeString() }]);
    };

    const runTests = async () => {
        setResults([]);
        
        // Test 1: Check token exists
        addResult('Token Check', token ? '✅ PASS' : '❌ FAIL', token ? 'Token exists in props' : 'No token provided');
        
        // Test 2: Check localStorage
        const storedToken = localStorage.getItem('studentToken');
        addResult('LocalStorage', storedToken ? '✅ PASS' : '❌ FAIL', storedToken ? 'Token found in localStorage' : 'No token in localStorage');
        
        // Test 3: Test backend connection
        try {
            const response = await fetch('http://localhost:3000/api/achievements/student', {
                method: 'GET'
            });
            addResult('Backend Connection', '✅ PASS', `Backend responding (Status: ${response.status})`);
        } catch (error) {
            addResult('Backend Connection', '❌ FAIL', `Cannot reach backend: ${error.message}`);
            return;
        }
        
        // Test 4: Test with auth header
        try {
            const response = await fetch('http://localhost:3000/api/students/profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            
            if (response.ok) {
                addResult('Profile API', '✅ PASS', `Profile loaded: ${data.name || 'Name missing'}`);
            } else {
                addResult('Profile API', '❌ FAIL', `Status ${response.status}: ${data.message || 'Unknown error'}`);
            }
        } catch (error) {
            addResult('Profile API', '❌ FAIL', error.message);
        }
        
        // Test 5: Test achievements API
        try {
            const response = await fetch('http://localhost:3000/api/achievements/student', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            
            if (response.ok) {
                addResult('Achievements API', '✅ PASS', `Found ${data.length} achievements`);
            } else {
                addResult('Achievements API', '❌ FAIL', `Status ${response.status}: ${data.message || 'Unknown error'}`);
            }
        } catch (error) {
            addResult('Achievements API', '❌ FAIL', error.message);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-8">
                    <h1 className="text-3xl font-bold text-white mb-6">🔧 System Diagnostic Test</h1>
                    
                    <button
                        onClick={runTests}
                        className="px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-400 transition-all mb-6"
                    >
                        Run All Tests
                    </button>

                    <div className="space-y-3">
                        {results.map((result, index) => (
                            <div
                                key={index}
                                className="bg-slate-700/50 border border-slate-600 rounded-lg p-4"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <span className="text-lg">{result.status}</span>
                                            <span className="font-semibold text-white">{result.test}</span>
                                            <span className="text-xs text-gray-400">{result.time}</span>
                                        </div>
                                        <p className={`text-sm ${result.status.includes('✅') ? 'text-green-400' : 'text-red-400'}`}>
                                            {result.message}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {results.length === 0 && (
                        <div className="text-center py-12 text-gray-400">
                            Click "Run All Tests" to diagnose the system
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DiagnosticTest;
