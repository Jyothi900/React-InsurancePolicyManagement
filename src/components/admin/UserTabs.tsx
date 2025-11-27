import { useState } from 'react';
import { Tabs, Tab, Box } from '@mui/material';

interface UserTabsProps {
  users: any[];
  onFilterChange: (role: string | null) => void;
  getRoleName: (role: number) => string;
}

export default function UserTabs({ users, onFilterChange, getRoleName }: UserTabsProps) {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    const roles = ['Customer', 'Agent', 'Underwriter'];
    onFilterChange(roles[newValue]);
  };

  const getCounts = () => {
    const customers = users.filter(u => getRoleName(u.role) === 'Customer').length;
    const agents = users.filter(u => getRoleName(u.role) === 'Agent').length;
    const underwriters = users.filter(u => getRoleName(u.role) === 'Underwriter').length;
    return { customers, agents, underwriters, total: users.length };
  };

  const counts = getCounts();

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
      <Tabs value={activeTab} onChange={handleTabChange}>
        <Tab label={`Customers (${counts.customers})`} />
        <Tab label={`Agents (${counts.agents})`} />
        <Tab label={`Underwriters (${counts.underwriters})`} />
      </Tabs>
    </Box>
  );
}