import React, { useState, useEffect } from 'react'
import ContentEditor from '../../components/content_editor/ContentEditor'
import { toast } from 'react-hot-toast'

const LMSTeacherDashboard = () => {
  const [courses, setCourses] = useState([])
  const [selectedCourse, setSelectedCourse] = useState('')
  const [lessons, setLessons] = useState([])
  const [selectedLesson, setSelectedLesson] = useState('')
  const [lessonForm, setLessonForm] = useState({ title: '', content: '', materials: [] })
  const [assignmentForm, setAssignmentForm] = useState({ title: '', description: '', dueDate: '' })
  const [quizForm, setQuizForm] = useState({ title: '', timeLimit: '', questions: [{ question: '', options: ['', '', '', ''], correctAnswer: '' }] })
  const [activeTab, setActiveTab] = useState('courses') // Keeps track of the currently active tab

  useEffect(() => {
    const fetchCourses = async () => {
      const res = await fetch('/api/teacher/courses')
      const data = await res.json()
      setCourses(data)
    }
    fetchCourses()
  }, [])

  useEffect(() => {
    if (!selectedCourse) return
    const fetchLessons = async () => {
      const res = await fetch(`/api/courses/${selectedCourse}/lessons`)
      const data = await res.json()
      setLessons(data)
    }
    fetchLessons()
  }, [selectedCourse])

  const handleLessonSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('title', lessonForm.title)
    formData.append('content', lessonForm.content)
    formData.append('course', selectedCourse)
    for (let i = 0; i < lessonForm.materials.length; i++) {
      formData.append('materials', lessonForm.materials[i])
    }

    const res = await fetch('/api/lessons', {
      method: 'POST',
      body: formData,
    })
    const data = await res.json()
    toast.success('Lesson added!')
    setLessons([...lessons, data])
  }

  const handleAssignmentSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      ...assignmentForm,
      lesson: selectedLesson,
    }
    const res = await fetch('/api/assignments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    await res.json()
    toast.success('Assignment added!')
  }

  const handleQuizSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      ...quizForm,
      lesson: selectedLesson,
    }
    const res = await fetch('/api/quizzes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    await res.json()
    toast.success('Quiz added!')
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'courses':
        return (
          <div>
            <h2 className="text-lg font-semibold">Courses</h2>
            <div>
              <label className="block mb-1 font-medium">Select Course</label>
              <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} className="w-full border rounded p-2">
                <option value="">-- Choose --</option>
                {courses.map(course => (
                  <option key={course._id} value={course._id}>{course.title}</option>
                ))}
              </select>
            </div>
          </div>
        )
      case 'lessons':
        return (
          <div>
            <h2 className="text-lg font-semibold">Add Lesson</h2>
            <form onSubmit={handleLessonSubmit} className="bg-white p-4 rounded shadow space-y-4 border">
              <input type="text" placeholder="Lesson title" className="w-full border p-2 rounded" value={lessonForm.title} onChange={e => setLessonForm({ ...lessonForm, title: e.target.value })} required />
              <ContentEditor model={lessonForm.content} handleModelChange={(content) => setLessonForm({ ...lessonForm, content })} />
              <input type="file" multiple onChange={e => setLessonForm({ ...lessonForm, materials: e.target.files })} className="w-full" />
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Create Lesson</button>
            </form>
          </div>
        )
      case 'assignments':
        return (
          <div>
            <h2 className="text-lg font-semibold">Add Assignment</h2>
            {selectedLesson && (
              <form onSubmit={handleAssignmentSubmit} className="bg-white p-4 rounded shadow space-y-4 border">
                <input type="text" placeholder="Assignment title" className="w-full border p-2 rounded" value={assignmentForm.title} onChange={e => setAssignmentForm({ ...assignmentForm, title: e.target.value })} required />
                <textarea placeholder="Assignment description" className="w-full border p-2 rounded" rows={4} value={assignmentForm.description} onChange={e => setAssignmentForm({ ...assignmentForm, description: e.target.value })} />
                <input type="date" className="w-full border p-2 rounded" value={assignmentForm.dueDate} onChange={e => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })} required />
                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Add Assignment</button>
              </form>
            )}
          </div>
        )
      case 'quizzes':
        return (
          <div>
            <h2 className="text-lg font-semibold">Add Quiz</h2>
            {selectedLesson && (
              <form onSubmit={handleQuizSubmit} className="bg-white p-4 rounded shadow space-y-4 border">
                <input type="text" placeholder="Quiz title" className="w-full border p-2 rounded" value={quizForm.title} onChange={e => setQuizForm({ ...quizForm, title: e.target.value })} required />
                <input type="number" placeholder="Time limit (minutes)" className="w-full border p-2 rounded" value={quizForm.timeLimit} onChange={e => setQuizForm({ ...quizForm, timeLimit: e.target.value })} required />
                {quizForm.questions.map((q, idx) => (
                  <div key={idx} className="bg-gray-50 p-2 border rounded mb-2">
                    <input type="text" placeholder={`Question ${idx + 1}`} className="w-full mb-1 p-2 border rounded" value={q.question} onChange={e => {
                      const updated = [...quizForm.questions]
                      updated[idx].question = e.target.value
                      setQuizForm({ ...quizForm, questions: updated })
                    }} />
                    {q.options.map((opt, i) => (
                      <input key={i} type="text" placeholder={`Option ${i + 1}`} className="w-full mb-1 p-2 border rounded" value={opt} onChange={e => {
                        const updated = [...quizForm.questions]
                        updated[idx].options[i] = e.target.value
                        setQuizForm({ ...quizForm, questions: updated })
                      }} />
                    ))}
                    <input type="text" placeholder="Correct Answer" className="w-full p-2 border rounded" value={q.correctAnswer} onChange={e => {
                      const updated = [...quizForm.questions]
                      updated[idx].correctAnswer = e.target.value
                      setQuizForm({ ...quizForm, questions: updated })
                    }} />
                  </div>
                ))}
                <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded">Add Quiz</button>
              </form>
            )}
          </div>
        )
      default:
        return <div>Select a tab to manage</div>
    }
  }

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="w-1/4 bg-gray-800 text-white p-4 space-y-4">
        <h2 className="text-2xl font-semibold mb-6">Teacher Dashboard</h2>
        <ul>
          <li onClick={() => setActiveTab('courses')} className="cursor-pointer p-2 hover:bg-gray-600 rounded">Courses</li>
          <li onClick={() => setActiveTab('lessons')} className="cursor-pointer p-2 hover:bg-gray-600 rounded">Lessons</li>
          <li onClick={() => setActiveTab('assignments')} className="cursor-pointer p-2 hover:bg-gray-600 rounded">Assignments</li>
          <li onClick={() => setActiveTab('quizzes')} className="cursor-pointer p-2 hover:bg-gray-600 rounded">Quizzes</li>
        </ul>
      </div>

      {/* Content */}
      <div className="w-3/4 p-6 bg-gray-100">
        {renderTabContent()}
      </div>
    </div>
  )
}

export default LMSTeacherDashboard
