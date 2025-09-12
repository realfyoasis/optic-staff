import { useState } from 'react';
import Sidebar from '@/components/Layout/Sidebar';
import MainDashboard from '@/components/Dashboard/MainDashboard';
import EmployeeTable from '@/components/Employee/EmployeeTable';
import VideoGrid from '@/components/VideoFeed/VideoGrid';
import ActivityLog from '@/components/Activity/ActivityLog';
import ModelUpload from '@/components/Model/ModelUpload';
import EnrollmentModal from '@/components/Enrollment/EnrollmentModal';
import { useEmployeeData } from '@/hooks/useEmployeeData';
import { YoloModel } from '@/types/employee';
import { useToast } from '@/hooks/use-toast';
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

  const [activeTab, setActiveTab] = useState('dashboard');
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

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <MainDashboard
            totalEmployees={totalEmployees}
            onlineEmployees={onlineEmployees}
            offlineEmployees={offlineEmployees}
            totalIncidents={incidents.length}
            activeFeeds={3}
            totalFeeds={4}
            onEnrollEmployee={handleEnrollEmployee}
          />
        );
      case 'employees':
        return (
          <div className="p-6">
            <EmployeeTable
              employees={employees}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />
          </div>
        );
      case 'feeds':
        return (
          <div className="p-6">
            <VideoGrid onEnrollEmployee={handleEnrollEmployee} />
          </div>
        );
      case 'enrollment':
        return (
          <div className="p-6">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">Employee Enrollment</h2>
              <p className="text-muted-foreground mb-6">
                Click "Upload Video" on any camera feed to start the enrollment process
              </p>
            </div>
          </div>
        );
      case 'incidents':
        return (
          <div className="p-6">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">Incident Management</h2>
              <p className="text-muted-foreground">
                {incidents.length} active incident{incidents.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        );
      case 'models':
        return (
          <div className="p-6">
            <ModelUpload onModelUpload={handleModelUpload} />
          </div>
        );
      case 'search':
        return (
          <div className="p-6">
            <EmployeeTable
              employees={employees}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />
          </div>
        );
      case 'settings':
        return (
          <div className="p-6">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">Settings</h2>
              <p className="text-muted-foreground">
                System configuration and preferences
              </p>
            </div>
          </div>
        );
      default:
        return (
          <MainDashboard
            totalEmployees={totalEmployees}
            onlineEmployees={onlineEmployees}
            offlineEmployees={offlineEmployees}
            totalIncidents={incidents.length}
            activeFeeds={3}
            totalFeeds={4}
            onEnrollEmployee={handleEnrollEmployee}
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {renderContent()}
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