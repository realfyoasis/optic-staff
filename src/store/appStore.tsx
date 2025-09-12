import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { VideoFeed, Employee, YoloModel, ActivityLog, Incident } from '@/types/employee';

interface AppState {
  feeds: VideoFeed[];
  employees: Employee[];
  models: YoloModel[];
  activityLogs: ActivityLog[];
  incidents: Incident[];
}

type AppAction =
  | { type: 'ADD_FEED'; payload: VideoFeed }
  | { type: 'UPDATE_FEED'; payload: VideoFeed }
  | { type: 'DELETE_FEED'; payload: string }
  | { type: 'ADD_EMPLOYEE'; payload: Employee }
  | { type: 'UPDATE_EMPLOYEE'; payload: Employee }
  | { type: 'ADD_MODEL'; payload: YoloModel }
  | { type: 'UPDATE_MODEL'; payload: YoloModel }
  | { type: 'DELETE_MODEL'; payload: string }
  | { type: 'ADD_ACTIVITY_LOG'; payload: ActivityLog }
  | { type: 'ADD_INCIDENT'; payload: Incident }
  | { type: 'UPDATE_FEEDS'; payload: VideoFeed[] };

const initialState: AppState = {
  feeds: [],
  employees: [],
  models: [],
  activityLogs: [],
  incidents: []
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'ADD_FEED':
      return { ...state, feeds: [...state.feeds, action.payload] };
    case 'UPDATE_FEED':
      return {
        ...state,
        feeds: state.feeds.map(feed =>
          feed.id === action.payload.id ? action.payload : feed
        )
      };
    case 'DELETE_FEED':
      return {
        ...state,
        feeds: state.feeds.filter(feed => feed.id !== action.payload)
      };
    case 'ADD_EMPLOYEE':
      return { ...state, employees: [...state.employees, action.payload] };
    case 'UPDATE_EMPLOYEE':
      return {
        ...state,
        employees: state.employees.map(emp =>
          emp.id === action.payload.id ? action.payload : emp
        )
      };
    case 'ADD_MODEL':
      return { ...state, models: [...state.models, action.payload] };
    case 'UPDATE_MODEL':
      return {
        ...state,
        models: state.models.map(model =>
          model.id === action.payload.id ? action.payload : model
        )
      };
    case 'DELETE_MODEL':
      return {
        ...state,
        models: state.models.filter(model => model.id !== action.payload)
      };
    case 'ADD_ACTIVITY_LOG':
      return {
        ...state,
        activityLogs: [action.payload, ...state.activityLogs.slice(0, 49)]
      };
    case 'ADD_INCIDENT':
      return { ...state, incidents: [action.payload, ...state.incidents] };
    case 'UPDATE_FEEDS':
      return { ...state, feeds: action.payload };
    default:
      return state;
  }
};

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  addFeed: (feed: VideoFeed) => void;
  updateFeed: (feed: VideoFeed) => void;
  addEmployee: (employee: Employee) => void;
  addModel: (model: YoloModel) => void;
  updateModel: (model: YoloModel) => void;
  deleteModel: (modelId: string) => void;
  addActivityLog: (log: ActivityLog) => void;
  addIncident: (incident: Incident) => void;
  getStats: () => {
    totalEmployees: number;
    onlineEmployees: number;
    offlineEmployees: number;
    totalIncidents: number;
    activeFeeds: number;
    totalFeeds: number;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppStore = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppStore must be used within AppStoreProvider');
  }
  return context;
};

interface AppStoreProviderProps {
  children: ReactNode;
}

export const AppStoreProvider: React.FC<AppStoreProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Real-time simulation for enrolled employees and active feeds
  useEffect(() => {
    if (state.employees.length === 0 && state.feeds.length === 0) return;

    const interval = setInterval(() => {
      // Update employee statuses
      if (state.employees.length > 0) {
        state.employees.forEach(emp => {
          if (Math.random() > 0.9) {
            const updatedEmployee = {
              ...emp,
              status: (['online', 'break', 'offline'][Math.floor(Math.random() * 3)] as Employee['status']),
              lastSeen: Math.random() > 0.8 ? new Date() : emp.lastSeen,
            };
            dispatch({ type: 'UPDATE_EMPLOYEE', payload: updatedEmployee });
          }
        });

        // Add activity logs for enrolled employees
        if (Math.random() > 0.7) {
          const randomEmployee = state.employees[Math.floor(Math.random() * state.employees.length)];
          const randomFeed = state.feeds[Math.floor(Math.random() * state.feeds.length)];
          if (randomFeed) {
            const newLog: ActivityLog = {
              timestamp: new Date(),
              employeeId: randomEmployee.id,
              employeeName: randomEmployee.name,
              cameraIndex: randomFeed.name,
              eventType: ['entry', 'exit', 'detected'][Math.floor(Math.random() * 3)] as ActivityLog['eventType'],
              location: randomFeed.location,
            };
            dispatch({ type: 'ADD_ACTIVITY_LOG', payload: newLog });
          }
        }
      }

      // Update feed employee detections based on enrolled employees and active models
      if (state.feeds.length > 0 && state.employees.length > 0) {
        const activeModels = state.models.filter(m => m.isActive && m.type === 'person_detection');
        
        const updatedFeeds = state.feeds.map(feed => {
          // Only show detections if there are active person detection models applied to this feed
          const hasActiveModel = activeModels.some(model => model.appliedFeeds.includes(feed.id));
          
          if (!hasActiveModel) {
            return { ...feed, employees: [] };
          }

          // Simulate random employee detections from enrolled employees
          const detectedEmployees = state.employees
            .filter(() => Math.random() > 0.6) // Random chance of detection
            .map(emp => ({
              employeeId: emp.id,
              name: emp.name,
              confidence: Math.random() * 0.4 + 0.6, // 60-100% confidence
              bbox: {
                x: Math.random() * 200 + 50,
                y: Math.random() * 150 + 30,
                width: 80 + Math.random() * 40,
                height: 100 + Math.random() * 50,
              },
              timestamp: new Date(),
            }));

          return { ...feed, employees: detectedEmployees };
        });

        dispatch({ type: 'UPDATE_FEEDS', payload: updatedFeeds });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [state.employees.length, state.feeds.length, state.models]);

  const addFeed = (feed: VideoFeed) => {
    dispatch({ type: 'ADD_FEED', payload: feed });
  };

  const updateFeed = (feed: VideoFeed) => {
    dispatch({ type: 'UPDATE_FEED', payload: feed });
  };

  const addEmployee = (employee: Employee) => {
    dispatch({ type: 'ADD_EMPLOYEE', payload: employee });
  };

  const addModel = (model: YoloModel) => {
    dispatch({ type: 'ADD_MODEL', payload: model });
  };

  const updateModel = (model: YoloModel) => {
    dispatch({ type: 'UPDATE_MODEL', payload: model });
  };

  const deleteModel = (modelId: string) => {
    dispatch({ type: 'DELETE_MODEL', payload: modelId });
  };

  const addActivityLog = (log: ActivityLog) => {
    dispatch({ type: 'ADD_ACTIVITY_LOG', payload: log });
  };

  const addIncident = (incident: Incident) => {
    dispatch({ type: 'ADD_INCIDENT', payload: incident });
  };

  const getStats = () => ({
    totalEmployees: state.employees.length,
    onlineEmployees: state.employees.filter(e => e.status === 'online').length,
    offlineEmployees: state.employees.filter(e => e.status === 'offline').length,
    totalIncidents: state.incidents.length,
    activeFeeds: state.feeds.filter(f => f.status === 'active').length,
    totalFeeds: state.feeds.length,
  });

  const value: AppContextType = {
    state,
    dispatch,
    addFeed,
    updateFeed,
    addEmployee,
    addModel,
    updateModel,
    deleteModel,
    addActivityLog,
    addIncident,
    getStats,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};