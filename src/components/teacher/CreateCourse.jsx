import { useState, useEffect } from 'react';
import { PlusCircle, X, Upload, ArrowLeft, BookOpen, List } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { baseURL, createCourse, getTeacherCourses } from '../../api/apis';
import { Link } from 'react-router-dom';

const InputField = ({ label, value, onChange, placeholder, required, type = 'text', className }) => (
  <div className={`space-y-2 ${className}`}>
    <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
      required={required}
    />
  </div>
);

const TagsInput = ({ tags, setTags }) => {
  const [inputValue, setInputValue] = useState('');

  const handleAddTag = (e) => {
    e.preventDefault();
    if (inputValue.trim() && !tags.includes(inputValue.trim())) {
      setTags([...tags, inputValue.trim()]);
      setInputValue('');
    }
  };

  const removeTag = (index) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
        Tags
        <span className="text-gray-400 text-xs">(Press enter to add)</span>
      </label>
      <div className="flex flex-wrap gap-2 items-center border border-gray-200 rounded-xl px-3 py-2">
        {tags.map((tag, index) => (
          <div key={index} className="flex items-center gap-2 bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          </div>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddTag(e)}
          placeholder="Add a tag..."
          className="flex-1 border-0 p-0 focus:ring-0 bg-transparent"
        />
      </div>
    </div>
  );
};

const ImageUpload = ({ image, setImage }) => {
  const { getRootProps, getInputProps } = useDropzone({
    accept: 'image/*',
    onDrop: files => {
      if (files[0]) {
        setImage(files[0]);
      }
    }
  });

  return (
    <div
      {...getRootProps()}
      className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 transition-colors bg-gray-50"
    >
      <input {...getInputProps()} />
      {image ? (
        typeof image === 'string' ? (
          <img src={image} alt="Course preview" className="max-h-48 mx-auto rounded-lg object-cover w-full" />
        ) : (
          <img src={URL.createObjectURL(image)} alt="Course preview" className="max-h-48 mx-auto rounded-lg object-cover w-full" />
        )
      ) : (
        <div className="space-y-3">
          <Upload className="mx-auto text-gray-400" size={32} />
          <p className="text-sm text-gray-600 font-medium">Upload course thumbnail</p>
          <p className="text-xs text-gray-500">Recommended size: 1200x600 pixels</p>
        </div>
      )}
    </div>
  );
};

const CoursePreview = ({ course }) => {
  const totalLessons = course?.lessons?.length || 0;

  return (
    <div className="border border-gray-100 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      <div className="relative aspect-video bg-gray-50">
        {course.image ? (
          <img
            src={typeof course.image === 'string' ? course.image : URL.createObjectURL(course.image)}
            alt="Course preview"
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-102"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
            <BookOpen className="w-8 h-8 text-gray-300" />
          </div>
        )}
        <span className="absolute bottom-3 right-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-lg text-xs font-medium text-gray-600 shadow-sm">
          Preview
        </span>
      </div>

      <div className="p-5 space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 leading-tight">
            {course.title || 'Course Title'}
          </h3>
          <p className="text-sm text-gray-500 line-clamp-2">
            {course.subtitle || 'Course subtitle will appear here'}
          </p>
        </div>

        {course.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {course.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2.5 py-1 bg-gray-50 text-gray-600 rounded-md text-xs font-medium border border-gray-100"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4 text-gray-600">
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-gray-400" />
                <span className="font-medium text-gray-900">${course.price || '0'}</span>
                <span className="text-gray-500">Price</span>
              </div>
              <div className="w-px h-4 bg-gray-200" />
              <div className="flex items-center gap-1.5">
                <List className="w-4 h-4 text-gray-400" />
                <span className="font-medium text-gray-900">{totalLessons}</span>
                <span className="text-gray-500">Lessons</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CreateCourseForm = ({ onBack }) => {
  const [course, setCourse] = useState({
    title: '',
    subtitle: '',
    description: '',
    price: '',
    tags: [],
    image: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('title', course.title);
      formData.append('subtitle', course.subtitle);
      formData.append('description', course.description);
      formData.append('price', course.price);
      formData.append('tags', JSON.stringify(course.tags));
      if (course.image) {
        formData.append('courseImage', course.image);
      }

      const response = await createCourse(formData);

      if (response.data.success) {
        onBack();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 sticky top-0 z-10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100"
        >
          <ArrowLeft size={18} />
          <span className="font-medium">Back to Courses</span>
        </button>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="course-form"
            disabled={loading}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium flex items-center gap-2"
          >
            {loading ? (
              'Creating...'
            ) : (
              <>
                <PlusCircle size={18} /> Create Course
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Details</h2>
            <form onSubmit={handleSubmit} className="space-y-6" id="course-form">
              {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              <ImageUpload
                image={course.image}
                setImage={(img) => setCourse({ ...course, image: img })}
              />

              <InputField
                label="Course Title"
                value={course.title}
                onChange={(e) => setCourse({ ...course, title: e.target.value })}
                placeholder="e.g., Advanced React Development"
                required
              />

              <InputField
                label="Subtitle"
                value={course.subtitle}
                onChange={(e) => setCourse({ ...course, subtitle: e.target.value })}
                placeholder="e.g., Master modern React patterns"
              />

              <InputField
                label="Price"
                type="number"
                value={course.price}
                onChange={(e) => setCourse({ ...course, price: e.target.value })}
                placeholder="e.g., 99.99"
                required
              />

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  Description
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={course.description}
                  onChange={(e) => setCourse({ ...course, description: e.target.value })}
                  placeholder="Detailed course description..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-40"
                  required
                />
              </div>

              <TagsInput
                tags={course.tags}
                setTags={(tags) => setCourse({ ...course, tags })}
              />
            </form>
          </div>
        </div>

        <div className="sticky top-20 h-fit">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Course Preview</h2>
            <CoursePreview course={course} />
          </div>
        </div>
      </div>
    </div>
  );
};

const ManageCourses = ({ onAddCourse }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await getTeacherCourses();
        setCourses(response.data.data);
        console.log(response.data.data.slug)

      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Courses</h2>
          <p className="text-gray-500 text-sm mt-1">Manage your existing courses</p>
        </div>
        <div className="w-full sm:w-auto flex gap-3">
          <input
            type="text"
            placeholder="Search courses..."
            className="px-4 py-2.5 border border-gray-200 rounded-xl w-full sm:w-64 focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            onClick={onAddCourse}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center gap-2 whitespace-nowrap"
          >
            <PlusCircle size={18} /> New Course
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading courses...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses
            .filter(course =>
              course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              course.subtitle?.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map(course => {
              const totalLessons = course?.lessons?.length || 0;

              return (
                <Link to={`/teacher/courses/${course.slug}`} key={course._id} className="block group">
                  <div className="border border-gray-100 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                    {/* Course Image */}
                    <div className="relative aspect-video bg-gray-50">
                      <img
                        src={`${baseURL}/${course.image?.replace(/\\/g, '/')}`}
                        alt="Course preview"
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-102"
                      />
                      <span className="absolute bottom-3 right-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-lg text-xs font-medium text-gray-600 shadow-sm">
                        Preview
                      </span>
                    </div>

                    {/* Course Details */}
                    <div className="p-5 space-y-4">
                      {/* Title and Subtitle */}
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 leading-tight">
                          {course.title}
                        </h3>
                        <p className="text-sm text-gray-500 line-clamp-2">
                          {course.subtitle}
                        </p>
                      </div>

                      {/* Tags */}
                      {course.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {course.tags.map((tag, index) => (
                            <span key={index} className="px-2.5 py-1 bg-gray-50 text-gray-600 rounded-md text-xs font-medium border border-gray-100">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Stats */}
                      <div className="pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-4 text-gray-600">
                            <div className="flex items-center gap-1.5">
                              <BookOpen className="w-4 h-4 text-gray-400" />
                              <span className="font-medium text-gray-900">${course.price}</span>
                              <span className="text-gray-500">Price</span>
                            </div>
                            <div className="w-px h-4 bg-gray-200" />
                            <div className="flex items-center gap-1.5">
                              <List className="w-4 h-4 text-gray-400" />
                              <span className="font-medium text-gray-900">{totalLessons}</span>
                              <span className="text-gray-500">Lessons</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
        </div>
      )
      }
    </div>
  );
};


const CreateCourse = () => {
  const [activeTab, setActiveTab] = useState('manage');

  return (
    <div className="max-w-9xl mx-auto p-4 bg-gray-50 min-h-screen">
      {activeTab === 'manage' ? (
        <ManageCourses onAddCourse={() => setActiveTab('add')} />
      ) : (
        <CreateCourseForm onBack={() => setActiveTab('manage')} />
      )}
    </div>
  );
};

export default CreateCourse;