import { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Employee } from '@/types/employee';
import { 
  Search, 
  Users, 
  Clock, 
  MapPin, 
  Phone, 
  Mail,
  Filter,
  Download
} from 'lucide-react';

interface EmployeeTableProps {
  employees: Employee[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const EmployeeTable = ({ employees, searchTerm, onSearchChange }: EmployeeTableProps) => {
  const [sortBy, setSortBy] = useState<'name' | 'role' | 'status' | 'lastSeen'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const getStatusColor = (status: Employee['status']) => {
    switch (status) {
      case 'online': return 'success';
      case 'break': return 'warning';
      case 'offline': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: Employee['status']) => {
    return (
      <div className={`w-2 h-2 rounded-full ${
        status === 'online' 
          ? 'bg-success animate-pulse-glow' 
          : status === 'break'
          ? 'bg-warning'
          : 'bg-muted-foreground'
      }`} />
    );
  };

  const formatLastSeen = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const sortedEmployees = [...employees].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'name':
        aValue = a.name;
        bValue = b.name;
        break;
      case 'role':
        aValue = a.role;
        bValue = b.role;
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      case 'lastSeen':
        aValue = a.lastSeen.getTime();
        bValue = b.lastSeen.getTime();
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-card to-card/80">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-foreground">
              Employee Directory
            </CardTitle>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, ID, or role..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 bg-input border-border"
            />
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-semibold text-foreground">
                      <button
                        onClick={() => handleSort('name')}
                        className="flex items-center hover:text-primary transition-colors"
                      >
                        Employee
                        {sortBy === 'name' && (
                          <span className="ml-1">
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </button>
                    </th>
                    <th className="text-left p-3 font-semibold text-foreground">
                      <button
                        onClick={() => handleSort('role')}
                        className="flex items-center hover:text-primary transition-colors"
                      >
                        Role
                        {sortBy === 'role' && (
                          <span className="ml-1">
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </button>
                    </th>
                    <th className="text-left p-3 font-semibold text-foreground">
                      <button
                        onClick={() => handleSort('status')}
                        className="flex items-center hover:text-primary transition-colors"
                      >
                        Status
                        {sortBy === 'status' && (
                          <span className="ml-1">
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </button>
                    </th>
                    <th className="text-left p-3 font-semibold text-foreground">Location</th>
                    <th className="text-left p-3 font-semibold text-foreground">
                      <button
                        onClick={() => handleSort('lastSeen')}
                        className="flex items-center hover:text-primary transition-colors"
                      >
                        Last Seen
                        {sortBy === 'lastSeen' && (
                          <span className="ml-1">
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </button>
                    </th>
                    <th className="text-left p-3 font-semibold text-foreground">Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedEmployees.map((employee, index) => (
                    <tr 
                      key={employee.id}
                      className="border-t border-border hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-3">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                              {employee.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-foreground">{employee.name}</p>
                            <p className="text-sm text-muted-foreground">ID: {employee.id}</p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-3">
                        <span className="text-sm font-medium text-foreground">
                          {employee.role}
                        </span>
                      </td>
                      
                      <td className="p-3">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(employee.status)}
                          <Badge variant={getStatusColor(employee.status) as any}>
                            {employee.status}
                          </Badge>
                        </div>
                      </td>
                      
                      <td className="p-3">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3 mr-1" />
                          {employee.currentLocation}
                        </div>
                      </td>
                      
                      <td className="p-3">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatLastSeen(employee.lastSeen)}
                        </div>
                      </td>
                      
                      <td className="p-3">
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <span className="truncate max-w-[200px]" title={employee.contact}>
                            {employee.contact}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {sortedEmployees.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No employees found matching your search.</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeTable;