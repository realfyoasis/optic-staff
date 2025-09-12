import { useState, useEffect } from 'react';
import { Employee, VideoFeed, ActivityLog, Incident } from '@/types/employee';

// Mock data for demonstration
const mockEmployees: Employee[] = [
  {
    id: '001',
    name: 'John Anderson',
    role: 'Software Engineer',
    contact: 'john.anderson@company.com',
    status: 'online',
    currentLocation: 'Office Floor 1',
    lastSeen: new Date(Date.now() - 5000),
  },
  {
    id: '002',
    name: 'Sarah Mitchell',
    role: 'Project Manager',
    contact: 'sarah.mitchell@company.com',
    status: 'online',
    currentLocation: 'Reception Area',
    lastSeen: new Date(Date.now() - 12000),
  },
  {
    id: '003',
    name: 'Michael Chen',
    role: 'DevOps Engineer',
    contact: 'michael.chen@company.com',
    status: 'break',
    currentLocation: 'Hallway B',
    lastSeen: new Date(Date.now() - 180000),
  },
  {
    id: '004',
    name: 'Emily Rodriguez',
    role: 'UX Designer',
    contact: 'emily.rodriguez@company.com',
    status: 'offline',
    currentLocation: 'Unknown',
    lastSeen: new Date(Date.now() - 3600000),
  },
];

const mockIncidents: Incident[] = [
  {
    id: 'inc001',
    type: 'unauthorized_access',
    severity: 'medium',
    timestamp: new Date(Date.now() - 300000),
    location: 'Reception Area',
    description: 'Unrecognized person detected at main entrance',
  },
];

export const useEmployeeData = () => {
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [incidents, setIncidents] = useState<Incident[]>(mockIncidents);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate employee status changes
      setEmployees(prev => prev.map(emp => ({
        ...emp,
        lastSeen: Math.random() > 0.8 ? new Date() : emp.lastSeen,
        status: Math.random() > 0.9 ? 
          (['online', 'break', 'offline'][Math.floor(Math.random() * 3)] as Employee['status']) : 
          emp.status
      })));

      // Add random activity logs
      if (Math.random() > 0.7) {
        const randomEmployee = mockEmployees[Math.floor(Math.random() * mockEmployees.length)];
        const newLog: ActivityLog = {
          timestamp: new Date(),
          employeeId: randomEmployee.id,
          employeeName: randomEmployee.name,
          cameraIndex: `Camera ${Math.floor(Math.random() * 3) + 1}`,
          eventType: ['entry', 'exit', 'detected'][Math.floor(Math.random() * 3)] as ActivityLog['eventType'],
          location: randomEmployee.currentLocation,
        };
        
        setActivityLogs(prev => [newLog, ...prev.slice(0, 49)]); // Keep last 50 logs
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.id.includes(searchTerm) ||
    emp.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return {
    employees: filteredEmployees,
    incidents,
    activityLogs,
    searchTerm,
    setSearchTerm,
    totalEmployees: employees.length,
    onlineEmployees: employees.filter(e => e.status === 'online').length,
    offlineEmployees: employees.filter(e => e.status === 'offline').length,
  };
};