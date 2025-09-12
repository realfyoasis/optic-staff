import { useState } from 'react';
import Sidebar from '@/components/Layout/Sidebar';
import MainDashboard from '@/components/Dashboard/MainDashboard';
import EmployeeTable from '@/components/Employee/EmployeeTable';
import VideoGrid from '@/components/VideoFeed/VideoGrid';
import ActivityLog from '@/components/Activity/ActivityLog';
import ModelUpload from '@/components/Model/ModelUpload';
import EnrollmentModal from '@/components/Enrollment/EnrollmentModal';
import ThemeSettings from '@/components/Settings/ThemeSettings';
import { useAppStore } from '@/store/appStore';
import { YoloModel } from '@/types/employee';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { toast } = useToast();
  const { state, addEmployee, addModel, getStats } = useAppStore();

  const stats = getStats();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [enrollmentModal, setEnrollmentModal] = useState({
    isOpen: false,
    feedId: '',
    feedImage: '',
  });

  const handleEnrollEmployee = (feedId: string) => {
    if (feedId === 'upload') {
      // Open video upload modal first
      setEnrollmentModal({
        isOpen: true,
        feedId: 'upload',
        feedImage: '',
      });
    } else {
      const targetFeed = state.feeds.find(f => f.id === feedId);
      setEnrollmentModal({
        isOpen: true,
        feedId,
        feedImage: targetFeed?.lastFrame || '',
      });
    }
  };

  const handleModelUpload = (model: YoloModel) => {
    addModel(model);
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
            totalEmployees={stats.totalEmployees}
            onlineEmployees={stats.onlineEmployees}
            offlineEmployees={stats.offlineEmployees}
            totalIncidents={stats.totalIncidents}
            activeFeeds={stats.activeFeeds}
            totalFeeds={stats.totalFeeds}
            onEnrollEmployee={handleEnrollEmployee}
          />
        );
      case 'employees':
        return (
          <div className="p-6">
            <EmployeeTable
              employees={state.employees}
              searchTerm=""
              onSearchChange={() => {}}
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
                {state.incidents.length} active incident{state.incidents.length !== 1 ? 's' : ''}
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
              employees={state.employees}
              searchTerm=""
              onSearchChange={() => {}}
            />
          </div>
        );
      case 'settings':
        return (
          <div className="p-6">
            <ThemeSettings />
          </div>
        );
      default:
        return (
          <MainDashboard
            totalEmployees={stats.totalEmployees}
            onlineEmployees={stats.onlineEmployees}
            offlineEmployees={stats.offlineEmployees}
            totalIncidents={stats.totalIncidents}
            activeFeeds={stats.activeFeeds}
            totalFeeds={stats.totalFeeds}
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