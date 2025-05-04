// components/admin/ContentManagement.jsx
import { DataGrid } from '@mui/x-data-grid';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@mui/material';

const ContentManagement = () => {
  const [courses] = useState([
    { 
      _id: '1',
      title: 'Introduction to React',
      price: 49.99,
      teacher: { name: 'John Doe' },
      createdAt: '2024-03-15'
    },
    { 
      _id: '2',
      title: 'Advanced JavaScript',
      price: 59.99,
      teacher: { name: 'Jane Smith' },
      createdAt: '2024-03-10'
    }
  ]);

  const handleEdit = (id) => {
    alert(`Editing course with ID: ${id}`);
  };

  const handleDelete = (id) => {
    alert(`Deleting course with ID: ${id}`);
  };

  const courseColumns = [
    { field: 'title', headerName: 'Title', flex: 1 },
    { field: 'price', headerName: 'Price', width: 120 },
    { 
      field: 'teacher', 
      headerName: 'Teacher', 
      valueGetter: (params) => params.row.teacher?.name 
    },
    { field: 'createdAt', headerName: 'Created At', width: 200 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      renderCell: (params) => (
        <div className="space-x-2">
          <Button 
            variant="outlined" 
            size="small"
            onClick={() => handleEdit(params.row._id)}
          >
            Edit
          </Button>
          <Button 
            variant="outlined" 
            color="error" 
            size="small"
            onClick={() => handleDelete(params.row._id)}
          >
            Delete
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Manage Courses</h2>
      <div className="h-96">
        <DataGrid
          rows={courses}
          columns={courseColumns}
          pageSize={10}
          checkboxSelection
        />
      </div>
    </div>
  );
};

export default ContentManagement;