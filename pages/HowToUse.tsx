
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const HowToUse: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'start' | 'forms' | 'features' | 'faq' | 'dev'>('start');

    return (
        <div className="animate-fade-in pb-12">
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.5s ease-out forwards;
                }
                .tab-btn {
                    padding: 12px 24px;
                    border-radius: 30px;
                    font-weight: 600;
                    transition: all 0.3s ease;
                    cursor: pointer;
                }
                .tab-btn.active {
                    background-color: #4f46e5;
                    color: white;
                    box-shadow: 0 4px 6px rgba(79, 70, 229, 0.3);
                }
                .tab-btn.inactive {
                    background-color: white;
                    color: #4b5563;
                    border: 1px solid #e5e7eb;
                }
                .tab-btn.inactive:hover {
                    background-color: #f3f4f6;
                }
                .info-card {
                    border-left: 4px solid #4f46e5;
                    background: white;
                    border-radius: 0 8px 8px 0;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                    transition: transform 0.2s;
                }
                .info-card:hover {
                    transform: translateX(5px);
                }
            `}</style>

            {/* Hero Header */}
            <div className="relative bg-gradient-to-br from-indigo-900 via-indigo-800 to-blue-900 rounded-3xl p-10 mb-10 text-white shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 opacity-20">
                    <svg width="400" height="400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 16h2v2h-2v-2zm0-6h2v4h-2v-4z"/></svg>
                </div>
                <div className="relative z-10">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">Master Your School ERP</h1>
                    <p className="text-lg md:text-xl text-indigo-100 max-w-3xl leading-relaxed">
                        A comprehensive guide to setting up, managing, and scaling your school operations with My Zini. 
                        Follow our step-by-step instructions to unlock the full potential of your digital campus.
                    </p>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex flex-wrap justify-center gap-4 mb-10">
                <button onClick={() => setActiveTab('start')} className={`tab-btn ${activeTab === 'start' ? 'active' : 'inactive'}`}>
                    🚀 Quick Start Guide
                </button>
                <button onClick={() => setActiveTab('forms')} className={`tab-btn ${activeTab === 'forms' ? 'active' : 'inactive'}`}>
                    📝 Form Field Manual
                </button>
                <button onClick={() => setActiveTab('features')} className={`tab-btn ${activeTab === 'features' ? 'active' : 'inactive'}`}>
                    ✨ Advanced Features
                </button>
                <button onClick={() => setActiveTab('dev')} className={`tab-btn ${activeTab === 'dev' ? 'active' : 'inactive'}`}>
                    👨‍🎓 Student App Setup
                </button>
                <button onClick={() => setActiveTab('faq')} className={`tab-btn ${activeTab === 'faq' ? 'active' : 'inactive'}`}>
                    ❓ FAQ & Support
                </button>
            </div>

            {/* Content Area */}
            <div className="max-w-6xl mx-auto min-h-[500px]">
                
                {/* Tab 1: Quick Start Flow */}
                {activeTab === 'start' && (
                    <div className="animate-fade-in-up space-y-8">
                        <div className="bg-white rounded-2xl shadow p-8">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">The Essential Setup Workflow</h2>
                            <div className="relative border-l-4 border-indigo-200 ml-4 space-y-12 py-4">
                                <TimelineItem 
                                    step="1" title="Setup School Profile" link="/profile"
                                    desc="First, define your school's identity. Upload your logo and address. This data is automatically stamped on all ID Cards, Certificates, and Bills."
                                />
                                <TimelineItem 
                                    step="2" title="Create Classes & Subjects" link="/classes"
                                    desc="Before adding students, you must create Classes (e.g., '10-A'). Set the 'Monthly Fee' here to automate dues calculation. Add Subjects for exam marksheets."
                                />
                                <TimelineItem 
                                    step="3" title="Onboard Staff" link="/staff"
                                    desc="Add your teaching and non-teaching staff. Set their monthly salary. This enables the 'Staff Attendance' and 'Expense' modules."
                                />
                                <TimelineItem 
                                    step="4" title="Admit Students" link="/students"
                                    desc="Now add students. Select their class first to get an auto-suggested Roll Number. Upload photos for ID cards."
                                />
                                <TimelineItem 
                                    step="5" title="Manage Finances" link="/fees-types"
                                    desc="Go to Fee Management. Use 'Add Monthly Dues' to bulk-apply fees. Use 'Other Fees' for transport or exam fees."
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab 2: Detailed Form Guide */}
                {activeTab === 'forms' && (
                    <div className="animate-fade-in-up grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <FieldGuideCard title="Add Student Form" color="green">
                            <FieldRow label="Full Name" desc="Legal name as it should appear on certificates." />
                            <FieldRow label="Class" desc="Mandatory. Must be created in 'Classes' page first." />
                            <FieldRow label="Roll No" desc="Unique ID in class. System suggests next available number." />
                            <FieldRow label="Mobile" desc="Primary contact for SMS/WhatsApp alerts. Also used for Student Login." />
                            <FieldRow label="Password" desc="Required for Student Login Portal." />
                            <FieldRow label="Father/Mother" desc="Required for ID Cards and official records." />
                            <FieldRow label="Previous Dues" desc="Enter any pending amount from last session here." />
                            <FieldRow label="Photo" desc="Passport size image. Auto-compressed for performance." />
                        </FieldGuideCard>

                        <FieldGuideCard title="Add Staff Form" color="orange">
                            <FieldRow label="Name" desc="Full name of employee." />
                            <FieldRow label="Mobile" desc="Contact number for emergency." />
                            <FieldRow label="Monthly Salary" desc="Fixed monthly payout. Used in Expense reports." />
                            <FieldRow label="Photo" desc="Required for Staff ID Card generation." />
                            <FieldRow label="Joining Date" desc="Used to calculate tenure." />
                        </FieldGuideCard>

                        <FieldGuideCard title="Add Class Form" color="blue">
                            <FieldRow label="Class Name" desc="E.g., '10-A', 'Nursery', 'XII-Science'." />
                            <FieldRow label="School Fees" desc="Monthly Tuition Fee. Auto-applied to all students in this class." />
                            <FieldRow label="Teacher" desc="Assign a Class Teacher from your Staff list." />
                        </FieldGuideCard>

                        <FieldGuideCard title="Fee Management" color="purple">
                            <FieldRow label="Fee Name" desc="E.g., 'Transport Fee', 'Annual Charge'." />
                            <FieldRow label="Frequency" desc="How often is it collected? (Monthly/One-time)." />
                            <FieldRow label="Add Monthly Dues (All)" desc="Bulk action. Marks selected months as 'Unpaid' for entire class." />
                        </FieldGuideCard>
                    </div>
                )}

                {/* Tab 3: Features */}
                {activeTab === 'features' && (
                    <div className="animate-fade-in-up space-y-6">
                        <FeatureBlock 
                            title="AI Query Helper" 
                            icon="🤖"
                            desc="Your personal assistant. Ask questions like 'Who hasn't paid fees in Class 10?' or 'Show me staff attendance for today'. It analyzes your database in real-time."
                        />
                        <FeatureBlock 
                            title="Generator Tools" 
                            icon="🖨️"
                            desc="Create professional PDFs instantly. Includes: Student ID Cards (8 templates), Marksheets (19 styles), Certificates (20+ designs), and Fee Bills."
                        />
                        <FeatureBlock 
                            title="Financial Dashboard" 
                            icon="📊"
                            desc="Track every rupee. See Profit/Loss, Expense Categories, Salary payouts, and Fee Collection trends in visual charts on your Dashboard."
                        />
                        <FeatureBlock 
                            title="Transport Management" 
                            icon="🚌"
                            desc="Manage your fleet. Add Drivers, assign them to specific routes (via notes), and link students to transport fees."
                        />
                    </div>
                )}

                {/* Tab 4: Student App Setup (DB Functions) */}
                {activeTab === 'dev' && (
                    <div className="animate-fade-in-up bg-white rounded-2xl shadow p-8 space-y-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="bg-green-100 p-3 rounded-full text-green-600">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">Secure Student Login System</h2>
                                <p className="text-gray-600">This Advanced SQL function ensures that students ONLY see their own data. It aggregates Profile, Fees, Exams, and Attendance into a single secure package.</p>
                            </div>
                        </div>

                        <div className="bg-gray-900 rounded-lg p-6 overflow-x-auto border border-gray-700 shadow-inner">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-mono text-green-400">PostgreSQL Function (Secure Aggregation)</span>
                                <span className="text-xs text-gray-500">Copy & Paste into Supabase SQL Editor</span>
                            </div>
                            <pre className="text-xs font-mono text-gray-300 whitespace-pre-wrap leading-relaxed">
{`-- Function: student_login_secure
-- Description: Authenticates a student and returns aggregated, secure data.
--              Includes strict checks to ensure data isolation.

CREATE OR REPLACE FUNCTION student_login_secure(phone_input text, pass_input text)
RETURNS json AS $$
DECLARE
    result_data json;
BEGIN
    SELECT json_agg(
        json_build_object(
            'student_profile', s,
            
            -- Fetch School Owner Details (Public Info only)
            'school_info', (
                SELECT json_build_object(
                    'school_name', o.school_name,
                    'address', o.address,
                    'principal_name', o.principal_name,
                    'school_image_url', o.school_image_url,
                    'mobile', o.mobile_number,
                    'website', o.website
                )
                FROM owner o WHERE o.uid = s.uid
            ),
            
            -- Fetch Exam Results specific to this student's Class and Roll Number
            'exam_results', (
                SELECT COALESCE(json_agg(r), '[]'::json)
                FROM exam_results r
                WHERE r.uid = s.uid
                AND r.class = s.class
                AND r.roll_number = s.roll_number
            ),
            
            -- Fetch Attendance: ONLY records where this student is marked Present or Absent.
            -- This strictly prevents seeing other students' attendance data.
            'attendance_records', (
                SELECT COALESCE(json_agg(
                    json_build_object(
                        'date', a.date,
                        'status', CASE
                            -- Check if Roll Number is in the comma-separated list
                            WHEN s.roll_number = ANY(string_to_array(a.present, ',')) THEN 'Present'
                            WHEN s.roll_number = ANY(string_to_array(a.absent, ',')) THEN 'Absent'
                            ELSE 'Holiday'
                        END
                    )
                ), '[]'::json)
                FROM attendance a
                -- Join strictly on ID to avoid ambiguity
                JOIN classes c ON a.class_id = c.id
                WHERE c.uid = s.uid
                AND c.class_name = s.class
                -- Ensure we only pick up rows where the student actually exists in the string
                AND (
                    s.roll_number = ANY(string_to_array(a.present, ','))
                    OR
                    s.roll_number = ANY(string_to_array(a.absent, ','))
                )
                -- Limit to current year to optimize size. Cast types explicitly for safety.
                AND a.date >= (EXTRACT(YEAR FROM CURRENT_DATE)::text || '-01-01')::date
            )
        )
    ) INTO result_data
    FROM students s
    -- Ensure mobile number is treated as text and trimmed for comparison
    WHERE TRIM(s.mobile::text) = TRIM(phone_input) AND s.password = pass_input;

    RETURN result_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;`}
                            </pre>
                        </div>
                        
                        <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 text-sm text-blue-800 mt-6">
                            <h4 className="font-bold mb-3 text-lg">Setup Instructions (Crucial Step)</h4>
                            <ol className="list-decimal list-inside space-y-2">
                                <li>Open your <strong>Supabase Dashboard</strong> and navigate to your project.</li>
                                <li>Click on the <strong>SQL Editor</strong> icon in the left sidebar.</li>
                                <li>Click <strong>New Query</strong> to open a blank editor.</li>
                                <li><strong>Copy</strong> the entire code block above and paste it into the editor.</li>
                                <li>Click the <strong>Run</strong> button (bottom right).</li>
                                <li>
                                    <span className="font-bold text-blue-700">Note:</span> This function sets the <code>search_path</code> to <code>public</code> to avoid permission errors during login.
                                    If you updated the function, run this query again to replace the old version.
                                </li>
                            </ol>
                        </div>
                    </div>
                )}


                {/* Tab 5: FAQ */}
                {activeTab === 'faq' && (
                    <div className="animate-fade-in-up bg-white rounded-2xl shadow p-8 space-y-6">
                        <FAQItem q="How do I delete a student?" a="Go to the Students page. In the table row for the student, click the Red Trash Icon. Note: This will also delete their exam results." />
                        <FAQItem q="How to collect fees?" a="Go to Students page -> Click the Eye Icon (View Profile). In the profile popup, scroll to the Fees section. Click 'Pay' next to the specific month." />
                        <FAQItem q="Can I edit an ID Card after generating?" a="No, the PDF is final. To change data, edit the Student Profile first, then regenerate the ID Card." />
                        <FAQItem q="My AI Helper isn't working?" a="Ensure your internet connection is stable. If it says 'ContentUnion error', try refreshing. The AI needs to connect to Google's servers." />
                        <FAQItem q="Student Login says 'Invalid Credentials'?" a="Ensure you have added a 'password' for the student in the Student Edit Modal. Also ensure you have run the SQL script mentioned in the 'Student App Setup' tab." />
                    </div>
                )}

            </div>
        </div>
    );
};

const TimelineItem: React.FC<{ step: string, title: string, desc: string, link: string }> = ({ step, title, desc, link }) => (
    <div className="relative pl-10">
        <div className="absolute left-0 top-0 -ml-5 bg-indigo-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 border-white shadow-md z-10">
            {step}
        </div>
        <div className="info-card p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-1">{title}</h3>
            <p className="text-gray-600 mb-3">{desc}</p>
            <Link to={link} className="text-indigo-600 font-semibold hover:underline text-sm">Go to Page &rarr;</Link>
        </div>
    </div>
);

const FieldGuideCard: React.FC<{ title: string, color: string, children: React.ReactNode }> = ({ title, color, children }) => {
    const colors: any = {
        green: 'border-green-500 text-green-700 bg-green-50',
        orange: 'border-orange-500 text-orange-700 bg-orange-50',
        blue: 'border-blue-500 text-blue-700 bg-blue-50',
        purple: 'border-purple-500 text-purple-700 bg-purple-50'
    };
    return (
        <div className={`bg-white rounded-xl shadow overflow-hidden border-t-4 ${colors[color].split(' ')[0]}`}>
            <div className={`p-4 font-bold text-lg ${colors[color]}`}>{title}</div>
            <div className="p-4 space-y-3 divide-y divide-gray-100">
                {children}
            </div>
        </div>
    );
};

const FieldRow: React.FC<{ label: string, desc: string }> = ({ label, desc }) => (
    <div className="pt-2 first:pt-0">
        <span className="font-semibold text-gray-800 block text-sm">{label}</span>
        <span className="text-gray-500 text-xs leading-relaxed">{desc}</span>
    </div>
);

const FeatureBlock: React.FC<{ title: string, icon: string, desc: string }> = ({ title, icon, desc }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow">
        <div className="text-4xl">{icon}</div>
        <div>
            <h3 className="text-lg font-bold text-gray-800">{title}</h3>
            <p className="text-gray-600 mt-1">{desc}</p>
        </div>
    </div>
);

const FAQItem: React.FC<{ q: string, a: string }> = ({ q, a }) => (
    <div className="border-b border-gray-100 pb-4 last:border-0">
        <h4 className="font-bold text-gray-800 mb-2 flex items-center">
            <span className="text-indigo-500 mr-2">Q.</span> {q}
        </h4>
        <p className="text-gray-600 text-sm pl-6">{a}</p>
    </div>
);

export default HowToUse;
