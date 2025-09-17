import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAppStore } from '@/store/appStore';
import { 
  User,
  Clock,
  MapPin,
  Phone,
  Mail,
  Eye,
  Edit3,
  ExternalLink,
  Trash2
} from 'lucide-react';

const EmployeeOverview = () => {
  const { state, deleteEmployee } = useAppStore();
  
  // Show only enrolled employees (first 3 for overview)
  const displayEmployees = state.employees.slice(0, 3);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'success';
      case 'break': return 'warning'; 
      case 'offline': return 'secondary';
      default: return 'secondary';
    }
  };

  const formatDuration = (status: string) => {
    if (status === 'offline') return '0m';
    // Mock duration calculation
    const hours = Math.floor(Math.random() * 8) + 1;
    const minutes = Math.floor(Math.random() * 59);
    return `${hours}h ${minutes}m`;
  };

  const getEmployeeInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatLastSeen = (date: Date, status: string) => {
    if (status === 'offline') {
      const diff = Date.now() - date.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours >= 1) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      const diff = Date.now() - date.getTime();
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    }
  };

  return (
    <Card className="bg-card shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Employee Overview</CardTitle>
          <Button variant="outline" size="sm">
            <ExternalLink className="h-4 w-4 mr-2" />
            View All
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {state.employees.length === 0 ? (
          <div className="text-center py-8">
            <User className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold mb-2">No Enrolled Employees</h3>
            <p className="text-muted-foreground">
              Enroll employees through video feeds to see them here
            </p>
          </div>
        ) : (
          <>
            {displayEmployees.map((employee) => (
              <Card key={employee.id} className="border bg-white">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    {/* Avatar */}
                    <Avatar className="h-12 w-12 flex-shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                        {getEmployeeInitials(employee.name)}
                      </AvatarFallback>
                    </Avatar>
                    
                    {/* Employee Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-sm text-foreground">{employee.name}</h3>
                          <p className="text-xs text-muted-foreground">{employee.role}</p>
                          <p className="text-xs text-muted-foreground">ID: {employee.id}</p>
                        </div>
                        <Badge variant={getStatusColor(employee.status) as any} className="text-xs">
                          {employee.status === 'online' ? 'Active' : employee.status}
                        </Badge>
                      </div>
                      
                      {/* Location and Duration */}
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center text-muted-foreground">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span>Location:</span>
                          </div>
                          <span className="font-medium">
                            {employee.status === 'offline' ? 'Offline' : employee.currentLocation}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>Duration:</span>
                          </div>
                          <span className="font-medium">{formatDuration(employee.status)}</span>
                        </div>
                      </div>
                      
                      {/* Contact Info */}
                      <div className="space-y-1 mb-3 text-xs">
                        <div className="flex items-center text-muted-foreground">
                          <Phone className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span>Contact: +1-555-0123</span>
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <Mail className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span className="truncate">Email: {employee.contact}</span>
                        </div>
                      </div>
                      
                      {/* Last Seen */}
                      <p className="text-xs text-muted-foreground mb-3">
                        Last seen: {formatLastSeen(employee.lastSeen, employee.status)}
                      </p>
                      
                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="text-xs h-7">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs h-7">
                          <Edit3 className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          className="text-xs h-7"
                          onClick={() => deleteEmployee(employee.id)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {state.employees.length > 3 && (
              <div className="text-center pt-4">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View All {state.employees.length} Employees
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default EmployeeOverview;