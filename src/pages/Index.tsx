import { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VideoGrid from '@/components/VideoFeed/VideoGrid';
import EmployeeTable from '@/components/Employee/EmployeeTable';
import StatsCards from '@/components/Dashboard/StatsCards';
import ActivityLog from '@/components/Activity/ActivityLog';
import ModelUpload from '@/components/Model/ModelUpload';
import EnrollmentModal from '@/components/Enrollment/EnrollmentModal';
import { useEmployeeData } from '@/hooks/useEmployeeData';
import { YoloModel } from '@/types/employee';
import { 
  LayoutDashboard, 
  Users, 
  Camera, 
  Brain, 
  Activity,
  AlertTriangle,
  Shield,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import heroImage from '@/assets/hero-bg.jpg';
import feed1 from '@/assets/feed1.jpg';

const Index = () => {
  const { toast } = useToast();
  const {
    employees,
    incidents,
    activityLogs,
    searchTerm,
    setSearchTerm,
    totalEmployees,
    onlineEmployees,
    offlineEmployees,
  } = useEmployeeData();

  const [enrollmentModal, setEnrollmentModal] = useState({
    isOpen: false,
    feedId: '',
    feedImage: '',
  });

  const handleEnrollEmployee = (feedId: string) => {
    // In a real app, this would get the current frame from the feed
    setEnrollmentModal({
      isOpen: true,
      feedId,
      feedImage: feed1, // Use mock image for demo
    });
  };

  const handleModelUpload = (model: YoloModel) => {
    toast({
      title: "Model Configuration Updated",
      description: `${model.name} has been applied to ${model.appliedFeeds.length} feeds.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div 
        className="relative h-32 bg-cover bg-center overflow-hidden"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/95" />
        <div className="relative h-full flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Employee Management System
            </h1>
            <p className="text-muted-foreground">
              Real-time facial recognition and incident monitoring powered by computer vision
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats Overview */}
        <StatsCards
          totalEmployees={totalEmployees}
          onlineEmployees={onlineEmployees}
          offlineEmployees={offlineEmployees}
          totalIncidents={incidents.length}
          activeFeeds={3}
          totalFeeds={3}
        />

        {/* Main Tabs */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="employees" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Employees</span>
            </TabsTrigger>
            <TabsTrigger value="feeds" className="flex items-center space-x-2">
              <Camera className="h-4 w-4" />
              <span className="hidden sm:inline">Live Feeds</span>
            </TabsTrigger>
            <TabsTrigger value="models" className="flex items-center space-x-2">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">Models</span>
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Activity</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Live Feeds Preview */}
              <div className="lg:col-span-2">
                <Card className="bg-gradient-to-br from-card to-card/80">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Camera className="h-5 w-5 text-primary" />
                        <span>Live Camera Feeds</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Switch to feeds tab
                          const feedsTab = document.querySelector('[value="feeds"]') as HTMLButtonElement;
                          feedsTab?.click();
                        }}
                      >
                        View All
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <VideoGrid onEnrollEmployee={handleEnrollEmployee} />
                  </CardContent>
                </Card>
              </div>

              {/* Right Sidebar */}
              <div className="space-y-6">
                {/* Recent Activity */}
                <ActivityLog logs={activityLogs.slice(0, 10)} />

                {/* System Status */}
                <Card className="bg-gradient-to-br from-card to-card/80">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="h-5 w-5 text-success" />
                      <span>System Status</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Face Recognition</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-success rounded-full animate-pulse-glow" />
                        <span className="text-sm font-medium">Active</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">YOLO Detection</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-success rounded-full animate-pulse-glow" />
                        <span className="text-sm font-medium">Running</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Database</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-success rounded-full animate-pulse-glow" />
                        <span className="text-sm font-medium">Connected</span>
                      </div>
                    </div>

                    {incidents.length > 0 && (
                      <div className="mt-4 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="h-4 w-4 text-destructive" />
                          <span className="text-sm font-medium text-destructive">
                            {incidents.length} Active Alert{incidents.length > 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Employees Tab */}
          <TabsContent value="employees">
            <EmployeeTable
              employees={employees}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />
          </TabsContent>

          {/* Live Feeds Tab */}
          <TabsContent value="feeds">
            <VideoGrid onEnrollEmployee={handleEnrollEmployee} />
          </TabsContent>

          {/* Models Tab */}
          <TabsContent value="models">
            <ModelUpload onModelUpload={handleModelUpload} />
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <ActivityLog logs={activityLogs} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Enrollment Modal */}
      <EnrollmentModal
        isOpen={enrollmentModal.isOpen}
        onClose={() => setEnrollmentModal({ isOpen: false, feedId: '', feedImage: '' })}
        feedId={enrollmentModal.feedId}
        feedImage={enrollmentModal.feedImage}
      />
    </div>
  );
};

export default Index;