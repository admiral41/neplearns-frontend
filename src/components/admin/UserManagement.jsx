import { DataGrid } from '@mui/x-data-grid';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Chip } from '@mui/material';

const UserManagement = () => {
  const [pendingTeachers] = useState([
    { 
      _id: '1', 
      name: 'John Doe', 
      email: 'john@example.com', 
      role: 'Teacher', 
      isApproved: false 
    },
    { 
      _id: '2', 
      name: 'Jane Smith', 
      email: 'jane@example.com', 
      role: 'Teacher', 
      isApproved: false 
    }
  ]);

  const [users] = useState([
    { 
      _id: '3', 
      name: 'Admin User', 
      email: 'admin@example.com', 
      role: 'Admin', 
      isApproved: true 
    },
    { 
      _id: '4', 
      name: 'Student 1', 
      email: 'student1@example.com', 
      role: 'Student', 
      isApproved: true 
    }
  ]);
  const approveTeacher = (id) => {
    alert(`Approving teacher with ID: ${id}`);
  };

  const handleUpdateRole = (id) => {
    alert(`Updating role for user ID: ${id}`);
  };

  const handleDelete = (id) => {
    alert(`Deleting user with ID: ${id}`);
  };


  const userColumns = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    { 
      field: 'role', 
      headerName: 'Role', 
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={params.value === 'Admin' ? 'primary' : 'default'}
        />
      )
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      renderCell: (params) => (
        params.row.isApproved ? 'Approved' : 'Pending'
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      renderCell: (params) => (
        <div className="space-x-2">
          <Button 
            variant="outlined" 
            size="small"
            onClick={() => handleUpdateRole(params.row._id)}
          >
            Change Role
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
    <div className="space-y-8">
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Pending Teacher Approvals</h2>
        <div className="h-64">
          <DataGrid
            rows={pendingTeachers}
            columns={[
              { field: 'name', headerName: 'Name', flex: 1 },
              { field: 'email', headerName: 'Email', flex: 1 },
              {
                field: 'actions',
                headerName: 'Actions',
                renderCell: (params) => (
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => approveTeacher(params.row._id)}
                  >
                    Approve
                  </Button>
                )
              }
            ]}
          />
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">All Users</h2>
        <div className="h-96">
          <DataGrid
            rows={users}
            columns={userColumns}
            pageSize={10}
            checkboxSelection
          />
        </div>
      </div>
    </div>
  );
};

export default UserManagement;