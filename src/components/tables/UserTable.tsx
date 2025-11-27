import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, IconButton } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import type { User } from '../../types/User';

import { useSelector } from 'react-redux';
import type { RootState } from '../../store';

interface UserTableProps {
  users: User[];
  loading?: boolean;
  onEdit?: (user: User) => void;
  onDelete?: (userId: string) => void;
}

export default function UserTable({ users, onEdit, onDelete }: UserTableProps) {
  const { userRoles } = useSelector((state: RootState) => state.enum);
  
  const getRoleColor = (role: number) => {
    switch (role) {
      case 2: return 'error';    // Admin
      case 1: return 'warning';  // Agent
      case 3: return 'info';     // Underwriter
      case 0: return 'success';  // Customer
      default: return 'default';
    }
  };
  
  const getRoleName = (role: number) => {
    const roleEnum = userRoles.find(r => r.value === role);
    return roleEnum?.name || 'Unknown';
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Phone</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.userId}>
              <TableCell>{user.fullName}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.mobile}</TableCell>
              <TableCell>
                <Chip label={getRoleName(user.role)} color={getRoleColor(user.role)} size="small" />
              </TableCell>
              <TableCell>
                <Chip 
                  label={user.isActive ? 'Active' : 'Inactive'} 
                  color={user.isActive ? 'success' : 'default'} 
                  size="small" 
                />
              </TableCell>
              <TableCell>
                <IconButton onClick={() => onEdit?.(user)} size="small">
                  <Edit />
                </IconButton>
                <IconButton onClick={() => onDelete?.(user.userId)} size="small">
                  <Delete />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
