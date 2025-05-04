import { useState } from 'react';
import { BookOpen, FileText, HelpCircle } from 'lucide-react';
import ContentView from 'react-froala-wysiwyg/FroalaEditorView';

const LessonDisplaySection = ({ lesson }) => {
  const [activeTab, setActiveTab] = useState('content');

  const tabs = [
    { id: 'content', label: 'Content', icon: <BookOpen size={16} /> },
    { id: 'quizzes', label: 'Quizzes', icon: <HelpCircle size={16} /> },
    { id: 'assignments', label: 'Assignments', icon: <FileText size={16} /> },
  ];

  return (
    <div>
      <div className="flex space-x-4 border-b mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-2 font-medium border-b-2 ${
              activeTab === tab.id
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-indigo-600 hover:border-indigo-300'
            }`}
          >
            <div className="flex items-center gap-1">
              {tab.icon}
              {tab.label}
            </div>
          </button>
        ))}
      </div>

      {activeTab === 'content' && lesson.content && (
        <div className="prose max-w-none">
          <ContentView model={lesson.content} />
        </div>
      )}

      {activeTab === 'quizzes' && (
        <div className="space-y-2">
          {lesson.quizzes?.length > 0 ? (
            lesson.quizzes.map((quiz, idx) => (
              <div key={idx} className="border p-3 rounded-lg shadow-sm">
                <h4 className="font-semibold">{quiz.title}</h4>
                <p className="text-sm text-gray-600">{quiz.description}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No quizzes available.</p>
          )}
        </div>
      )}

      {activeTab === 'assignments' && (
        <div className="space-y-2">
          {lesson.assignments?.length > 0 ? (
            lesson.assignments.map((assignment, idx) => (
              <div key={idx} className="border p-3 rounded-lg shadow-sm">
                <h4 className="font-semibold">{assignment.title}</h4>
                <p className="text-sm text-gray-600">{assignment.description}</p>
                {assignment.dueDate && (
                  <p className="text-xs text-gray-500">
                    Due: {new Date(assignment.dueDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No assignments available.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default LessonDisplaySection;
