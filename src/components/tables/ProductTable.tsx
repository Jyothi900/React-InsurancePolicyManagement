import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, IconButton } from '@mui/material';
import { Edit, Delete, Visibility } from '@mui/icons-material';
import type { PolicyProduct, PolicyType } from '../../types/Product';

const getPolicyTypeLabel = (policyType: PolicyType): string => {
  const labels = {
    0: 'Term Life',
    1: 'Endowment', 
    2: 'ULIP',
    3: 'Money Back',
    4: 'Pension',
    5: 'Child Plan',
    6: 'Personal Accident'
  };
  return labels[policyType] || 'Unknown';
};

interface ProductTableProps {
  products: PolicyProduct[];
  loading?: boolean;
  onEdit?: (product: PolicyProduct) => void;
  onDelete?: (productId: string) => void;
  onView?: (product: PolicyProduct) => void;
}

export default function ProductTable({ products, onEdit, onDelete, onView }: ProductTableProps) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Product Name</TableCell>
            <TableCell>Policy Type</TableCell>
            <TableCell>Premium Rate</TableCell>
            <TableCell>Max Sum Assured</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.productId}>
              <TableCell>{product.productName}</TableCell>
              <TableCell>{getPolicyTypeLabel(product.policyType)}</TableCell>
              <TableCell>₹{product.premiumRate}</TableCell>
              <TableCell>₹{product.maxSumAssured.toLocaleString()}</TableCell>
              <TableCell>
                <Chip 
                  label={product.isActive ? 'Active' : 'Inactive'} 
                  color={product.isActive ? 'success' : 'default'} 
                  size="small" 
                />
              </TableCell>
              <TableCell>
                <IconButton onClick={() => onView?.(product)} size="small">
                  <Visibility />
                </IconButton>
                <IconButton onClick={() => onEdit?.(product)} size="small">
                  <Edit />
                </IconButton>
                <IconButton onClick={() => onDelete?.(product.productId)} size="small">
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