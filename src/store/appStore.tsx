import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { VideoFeed, Employee, YoloModel, ActivityLog, Incident } from '@/types/employee';

// Define the state shape
interface AppState {
  feeds: VideoFeed[];
  employees: Employee[];
  models: YoloModel[];
  activityLogs: ActivityLog[];
  incidents: Incident[];
}

// Define action types
type AppAction = 
  | { type: 'ADD_FEED'; payload: VideoFeed }
  | { type: 'UPDATE_FEED'; payload: VideoFeed }
  | { type: 'DELETE_FEED'; payload: string }
  | { type: 'ADD_EMPLOYEE'; payload: Employee }
  | { type: 'UPDATE_EMPLOYEE'; payload: Employee }
  | { type: 'DELETE_EMPLOYEE'; payload: string }
  | { type: 'ADD_MODEL'; payload: YoloModel }
  | { type: 'UPDATE_MODEL'; payload: YoloModel }
  | { type: 'DELETE_MODEL'; payload: string }
  | { type: 'ADD_ACTIVITY_LOG'; payload: ActivityLog }
  | { type: 'ADD_INCIDENT'; payload: Incident }
  | { type: 'UPDATE_FEEDS'; payload: VideoFeed[] };

// localStorage persistence helpers
const saveToStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

const loadFromStorage = (key: string, defaultValue: any) => {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return defaultValue;
    
    const parsed = JSON.parse(stored);
    
    // Convert date strings back to Date objects for specific data types
    if (key === 'employees') {
      return parsed.map((emp: any) => ({
        ...emp,
        lastSeen: new Date(emp.lastSeen)
      }));
    }
    
    if (key === 'models') {
      return parsed.map((model: any) => ({
        ...model,
        uploadDate: new Date(model.uploadDate)
      }));
    }
    
    return parsed;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return defaultValue;
  }
};

const initialState: AppState = {
  feeds: [],
  employees: [],
  models: [],
  activityLogs: [],
  incidents: []
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  let newState: AppState;
  
  switch (action.type) {
    case 'ADD_FEED':
      newState = { ...state, feeds: [...state.feeds, action.payload] };
      break;
    case 'UPDATE_FEED':
      newState = {
        ...state,
        feeds: state.feeds.map(feed =>
          feed.id === action.payload.id ? action.payload : feed
        )
      };
      break;
    case 'DELETE_FEED':
      newState = {
        ...state,
        feeds: state.feeds.filter(feed => feed.id !== action.payload)
      };
      break;
    case 'ADD_EMPLOYEE':
      newState = { ...state, employees: [...state.employees, action.payload] };
      break;
    case 'UPDATE_EMPLOYEE':
      newState = {
        ...state,
        employees: state.employees.map(emp =>
          emp.id === action.payload.id ? action.payload : emp
        )
      };
      break;
    case 'DELETE_EMPLOYEE':
      newState = {
        ...state,
        employees: state.employees.filter(emp => emp.id !== action.payload)
      };
      break;
    case 'ADD_MODEL':
      newState = { ...state, models: [...state.models, action.payload] };
      break;
    case 'UPDATE_MODEL':
      newState = {
        ...state,
        models: state.models.map(model =>
          model.id === action.payload.id ? action.payload : model
        )
      };
      break;
    case 'DELETE_MODEL':
      newState = {
        ...state,
        models: state.models.filter(model => model.id !== action.payload)
      };
      break;
    case 'ADD_ACTIVITY_LOG':
      newState = {
        ...state,
        activityLogs: [action.payload, ...state.activityLogs.slice(0, 49)]
      };
      break;
    case 'ADD_INCIDENT':
      newState = { ...state, incidents: [action.payload, ...state.incidents] };
      break;
    case 'UPDATE_FEEDS':
      newState = { ...state, feeds: action.payload };
      break;
    default:
      newState = state;
  }

  // No persistence - everything starts fresh on reload

  return newState;
};

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  addFeed: (feed: VideoFeed) => void;
  updateFeed: (feed: VideoFeed) => void;
  deleteFeed: (feedId: string) => void;
  addEmployee: (employee: Employee) => void;
  updateEmployee: (employee: Employee) => void;
  deleteEmployee: (employeeId: string) => void;
  addModel: (model: YoloModel) => void;
  updateModel: (model: YoloModel) => void;
  deleteModel: (modelId: string) => void;
  addActivityLog: (log: ActivityLog) => void;
  addIncident: (incident: Incident) => void;
  getStats: () => {
    totalEmployees: number;
    onlineEmployees: number;
    offlineEmployees: number;
    totalFeeds: number;
    activeFeeds: number;
    totalIncidents: number;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppStore = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppStore must be used within an AppStoreProvider');
  }
  return context;
};

export const AppStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const addFeed = (feed: VideoFeed) => {
    dispatch({ type: 'ADD_FEED', payload: feed });
  };

  const updateFeed = (feed: VideoFeed) => {
    dispatch({ type: 'UPDATE_FEED', payload: feed });
  };

  const deleteFeed = (feedId: string) => {
    dispatch({ type: 'DELETE_FEED', payload: feedId });
  };

  const addEmployee = (employee: Employee) => {
    dispatch({ type: 'ADD_EMPLOYEE', payload: employee });
  };

  const updateEmployee = (employee: Employee) => {
    dispatch({ type: 'UPDATE_EMPLOYEE', payload: employee });
  };

  const deleteEmployee = (employeeId: string) => {
    dispatch({ type: 'DELETE_EMPLOYEE', payload: employeeId });
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

  const getStats = () => {
    const totalEmployees = state.employees.length;
    const onlineEmployees = state.employees.filter(emp => emp.status === 'online').length;
    const offlineEmployees = totalEmployees - onlineEmployees;
    const totalFeeds = state.feeds.length;
    const activeFeeds = state.feeds.filter(feed => feed.status === 'active').length;
    
    return {
      totalEmployees,
      onlineEmployees,
      offlineEmployees,
      totalFeeds,
      activeFeeds,
      totalIncidents: state.incidents.length,
    };
  };

  const value: AppContextType = {
    state,
    dispatch,
    addFeed,
    updateFeed,
    deleteFeed,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    addModel,
    updateModel,
    deleteModel,
    addActivityLog,
    addIncident,
    getStats,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};