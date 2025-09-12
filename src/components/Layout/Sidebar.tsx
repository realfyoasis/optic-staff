import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard,
  Users,
  Camera,
  UserPlus,
  AlertTriangle,
  Brain,
  Search,
  Settings,
  Shield,
  ChevronLeft,
  Menu
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar = ({ activeTab, onTabChange }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigation = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'feeds', label: 'Camera Feeds', icon: Camera },
    { id: 'enrollment', label: 'Enrollment', icon: UserPlus },
    { id: 'incidents', label: 'Incidents', icon: AlertTriangle },
    { id: 'models', label: 'Model Upload', icon: Brain },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className={`bg-primary h-screen transition-all duration-300 flex flex-col ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-primary-foreground/10">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-foreground rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div className="text-primary-foreground">
                <h1 className="font-bold text-lg">EMS</h1>
                <p className="text-xs opacity-80">Employee Management</p>
              </div>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-primary-foreground hover:bg-primary-foreground/10"
          >
            {isCollapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* User Profile */}
      {!isCollapsed && (
        <div className="p-4 border-b border-primary-foreground/10">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary-foreground text-primary font-semibold">
                A
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-primary-foreground">Admin User</p>
              <p className="text-xs text-primary-foreground/70 truncate">admin@company.com</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 p-2 space-y-1">
        {navigation.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => onTabChange(item.id)}
              className={`w-full justify-start text-primary-foreground hover:bg-primary-foreground/10 ${
                isActive ? 'bg-primary-foreground/20' : ''
              } ${isCollapsed ? 'px-2' : 'px-3'}`}
            >
              <IconComponent className="h-4 w-4 min-w-[16px]" />
              {!isCollapsed && <span className="ml-3">{item.label}</span>}
              {isActive && !isCollapsed && (
                <div className="ml-auto w-1 h-1 bg-primary-foreground rounded-full" />
              )}
            </Button>
          );
        })}
      </div>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-primary-foreground/10">
          <div className="text-center">
            <Badge variant="outline" className="text-primary-foreground border-primary-foreground/20">
              v1.0.0
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;