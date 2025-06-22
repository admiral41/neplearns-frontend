import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Api } from '../../api/apis';
import { toast } from 'react-hot-toast';

const UserSetting = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [user, setUser] = useState(null);

  // Load user data from localStorage
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) {
      setUser(userData);
    }
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm();

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setValue('username', user.username);
      setValue('email', user.email);
    }
  }, [user, setValue]);

  // Update both state and localStorage
  const updateUserData = (newData) => {
    const updatedUser = { ...user, ...newData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const onSubmitProfile = async (data) => {
    setIsLoading(true);
    try {
      const response = await Api.patch('/api/auth/profile', {
        username: data.username,
      });
      
      // Update both state and localStorage
      updateUserData({ username: data.username });
      
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitPassword = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await Api.put('/api/auth/changepassword', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Password changed successfully');
      reset({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setPasswordError('');
    } catch (error) {
      setPasswordError(
        error.response?.data?.message || 'Failed to change password'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Account Settings</h1>
      
      {/* User Profile Summary */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-xl font-semibold text-blue-600">
              {user.username.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">{user.username}</h2>
            <p className="text-gray-600">{user.email}</p>
            <div className="flex items-center mt-2">
              <span className={`px-2 py-1 text-xs rounded-full ${
                user.role === 'Admin' ? 'bg-purple-100 text-purple-800' :
                user.role === 'Teacher' ? 'bg-green-100 text-green-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {user.role}
              </span>
              {user.role === 'Teacher' && (
                <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                  user.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {user.isApproved ? 'Verified' : 'Pending'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Settings Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('profile')}
          className={`mr-6 pb-2 font-medium ${
            activeTab === 'profile'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-blue-600'
          }`}
        >
          Profile
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`mr-6 pb-2 font-medium ${
            activeTab === 'password'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-blue-600'
          }`}
        >
          Password
        </button>
      </div>

      {/* Profile Settings */}
      {activeTab === 'profile' && (
        <div className="bg-white shadow rounded-xl p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-5">Profile Information</h3>
          <form onSubmit={handleSubmit(onSubmitProfile)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                {...register('username', {
                  required: 'Username is required',
                  minLength: {
                    value: 3,
                    message: 'Username must be at least 3 characters',
                  },
                })}
                className="w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full p-2.5 bg-gray-100 border border-gray-300 rounded-md text-gray-600 cursor-not-allowed"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Password Settings */}
      {activeTab === 'password' && (
        <div className="bg-white shadow rounded-xl p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-5">Change Password</h3>
          <form onSubmit={handleSubmit(onSubmitPassword)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <input
                type="password"
                {...register('currentPassword', {
                  required: 'Current password is required',
                })}
                className="w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.currentPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.currentPassword.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                {...register('newPassword', {
                  required: 'New password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
                className="w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.newPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password"
                {...register('confirmPassword', {
                  required: 'Please confirm your new password',
                  validate: (value) =>
                    value === watch('newPassword') || 'Passwords do not match',
                })}
                className="w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            {passwordError && (
              <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
                {passwordError}
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Updating...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default UserSetting;