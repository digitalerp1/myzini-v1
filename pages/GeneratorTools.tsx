import React from 'react';
import IdCardGenerator from '../components/generators/IdCardGenerator';

const tools = [
    { name: 'ID Card Generator', component: <IdCardGenerator />, description: 'Generate and print student ID cards for an entire class.', enabled: true },
    { name: 'Fees Dues Bill', component: null, description: 'Create bills for outstanding student fees.', enabled: false },
    { name: 'Exam Bills', component: null, description: 'Generate bills for examination fees.', enabled: false },
    { name: 'Student Progress Report', component: null, description: 'Design and print student report cards.', enabled: false },
];

const GeneratorTools: React.FC = () => {
    const [selectedTool, setSelectedTool] = React.useState(tools[0]);

    if (!selectedTool) {
         return <div>Error: No tool selected.</div>
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Generator Tools</h1>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {tools.map(tool => (
                    <button 
                        key={tool.name}
                        onClick={() => tool.enabled && setSelectedTool(tool)}
                        disabled={!tool.enabled}
                        className={`p-4 rounded-lg text-left transition-all border-2
                            ${selectedTool.name === tool.name ? 'bg-primary text-white border-primary-dark shadow-lg' : 'bg-white hover:border-primary'}
                            ${!tool.enabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`}
                    >
                        <h3 className="font-bold">{tool.name}</h3>
                        {!tool.enabled && <span className="text-xs font-semibold">(Coming Soon)</span>}
                    </button>
                ))}
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg mt-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedTool.name}</h2>
                <p className="text-gray-600 mb-6">{selectedTool.description}</p>
                {selectedTool.component}
            </div>
        </div>
    );
};

export default GeneratorTools;
