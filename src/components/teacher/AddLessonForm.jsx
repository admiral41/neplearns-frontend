import React, { useState, useEffect } from 'react'
import ContentEditor from '../../components/content_editor/ContentEditor'
import { toast } from 'react-hot-toast'

const LessonManager = () => {
  const [courses, setCourses] = useState([])
  const [selectedCourse, setSelectedCourse] = useState('')
  const [lessons, setLessons] = useState([])
  const [selectedLesson, setSelectedLesson] = useState('')

  const [lessonForm, setLessonForm] = useState({ title: '', content: '', materials: [] })
  const [assignmentForm, setAssignmentForm] = useState({ title: '', description: '', dueDate: '' })
  const [quizForm, setQuizForm] = useState({
    title: '',
    timeLimit: '',
    questions: [
      { question: '', options: ['', '', '', ''], correctAnswer: '' }
    ]
  })

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

    const res = await fetch('/api/lessons/add', {
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
    await fetch('/api/assignments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    toast.success('Assignment added!')
  }

  const handleQuizSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      ...quizForm,
      lesson: selectedLesson,
    }
    await fetch('/api/quizzes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    toast.success('Quiz added!')
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 p-4">
      {/* Lesson Creator Form with Course Selector */}
      <form onSubmit={handleLessonSubmit} className="bg-white p-6 rounded shadow border space-y-6">
        <h2 className="text-xl font-semibold text-gray-700">Add Lesson</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Select Course</label>
            <select
              value={selectedCourse}
              onChange={e => setSelectedCourse(e.target.value)}
              className="w-full border p-2 rounded"
              required
            >
              <option value="">-- Choose --</option>
              {courses.map(course => (
                <option key={course._id} value={course._id}>{course.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Lesson Title</label>
            <input
              type="text"
              placeholder="Lesson title"
              className="w-full border p-2 rounded"
              value={lessonForm.title}
              onChange={e => setLessonForm({ ...lessonForm, title: e.target.value })}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Content</label>
          <ContentEditor
            model={lessonForm.content}
            handleModelChange={(content) => setLessonForm({ ...lessonForm, content })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Upload Materials</label>
          <input
            type="file"
            multiple
            onChange={e => setLessonForm({ ...lessonForm, materials: e.target.files })}
            className="w-full"
          />
        </div>

        <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700">
          Create Lesson
        </button>
      </form>

      {/* Lesson Selector */}
      {lessons.length > 0 && (
        <div>
          <label className="block font-medium mb-1">Select Lesson</label>
          <select
            value={selectedLesson}
            onChange={e => setSelectedLesson(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option value="">-- Choose --</option>
            {lessons.map(lesson => (
              <option key={lesson._id} value={lesson._id}>{lesson.title}</option>
            ))}
          </select>
        </div>
      )}

      {/* Assignment Form */}
      {selectedLesson && (
        <form onSubmit={handleAssignmentSubmit} className="bg-white p-6 rounded shadow border space-y-4">
          <h2 className="text-xl font-semibold text-gray-700">Add Assignment</h2>
          <input
            type="text"
            placeholder="Assignment title"
            className="w-full border p-2 rounded"
            value={assignmentForm.title}
            onChange={e => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
            required
          />
          <textarea
            placeholder="Assignment description"
            className="w-full border p-2 rounded"
            rows={4}
            value={assignmentForm.description}
            onChange={e => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
          />
          <input
            type="date"
            className="w-full border p-2 rounded"
            value={assignmentForm.dueDate}
            onChange={e => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })}
            required
          />
          <button type="submit" className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700">
            Add Assignment
          </button>
        </form>
      )}

      {/* Quiz Form */}
      {selectedLesson && (
        <form onSubmit={handleQuizSubmit} className="bg-white p-6 rounded shadow border space-y-4">
          <h2 className="text-xl font-semibold text-gray-700">Add Quiz</h2>
          <input
            type="text"
            placeholder="Quiz title"
            className="w-full border p-2 rounded"
            value={quizForm.title}
            onChange={e => setQuizForm({ ...quizForm, title: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Time limit (minutes)"
            className="w-full border p-2 rounded"
            value={quizForm.timeLimit}
            onChange={e => setQuizForm({ ...quizForm, timeLimit: e.target.value })}
            required
          />

          {quizForm.questions.map((q, idx) => (
            <div key={idx} className="bg-gray-50 p-4 border rounded space-y-2">
              <input
                type="text"
                placeholder={`Question ${idx + 1}`}
                className="w-full p-2 border rounded"
                value={q.question}
                onChange={e => {
                  const updated = [...quizForm.questions]
                  updated[idx].question = e.target.value
                  setQuizForm({ ...quizForm, questions: updated })
                }}
              />
              {q.options.map((opt, i) => (
                <input
                  key={i}
                  type="text"
                  placeholder={`Option ${i + 1}`}
                  className="w-full p-2 border rounded"
                  value={opt}
                  onChange={e => {
                    const updated = [...quizForm.questions]
                    updated[idx].options[i] = e.target.value
                    setQuizForm({ ...quizForm, questions: updated })
                  }}
                />
              ))}
              <input
                type="text"
                placeholder="Correct Answer"
                className="w-full p-2 border rounded"
                value={q.correctAnswer}
                onChange={e => {
                  const updated = [...quizForm.questions]
                  updated[idx].correctAnswer = e.target.value
                  setQuizForm({ ...quizForm, questions: updated })
                }}
              />
            </div>
          ))}

          <button type="submit" className="bg-purple-600 text-white px-5 py-2 rounded hover:bg-purple-700">
            Add Quiz
          </button>
        </form>
      )}
    </div>
  )
}

export default LessonManager
