import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import StatsCards from './StatsCards';
import CameraFeedGrid from '../VideoFeed/CameraFeedGrid';
import EmployeeOverview from '../Employee/EmployeeOverview';
import { Download, Filter } from 'lucide-react';

interface MainDashboardProps {
  totalEmployees: number;
  onlineEmployees: number;
  offlineEmployees: number;
  totalIncidents: number;
  activeFeeds: number;
  totalFeeds: number;
  onEnrollEmployee: (feedId: string) => void;
}

const MainDashboard = ({
  totalEmployees,
  onlineEmployees,
  offlineEmployees,
  totalIncidents,
  activeFeeds,
  totalFeeds,
  onEnrollEmployee
}: MainDashboardProps) => {
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Monitor employees and manage security systems</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards
        totalEmployees={totalEmployees}
        onlineEmployees={onlineEmployees}
        offlineEmployees={offlineEmployees}
        totalIncidents={totalIncidents}
        activeFeeds={activeFeeds}
        totalFeeds={totalFeeds}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Camera Feeds - Takes 2 columns */}
        <div className="lg:col-span-2">
          <CameraFeedGrid onEnrollEmployee={onEnrollEmployee} />
        </div>

        {/* Employee Overview - Takes 1 column */}
        <div>
          <EmployeeOverview />
        </div>
      </div>
    </div>
  );
};

export default MainDashboard;