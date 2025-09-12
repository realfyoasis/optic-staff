import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ActivityLog as ActivityLogType } from '@/types/employee';
import { 
  Clock, 
  User, 
  Camera, 
  ArrowRight, 
  ArrowLeft, 
  Eye,
  EyeOff
} from 'lucide-react';

interface ActivityLogProps {
  logs: ActivityLogType[];
}

const ActivityLog = ({ logs }: ActivityLogProps) => {
  const getEventIcon = (eventType: ActivityLogType['eventType']) => {
    switch (eventType) {
      case 'entry': return ArrowRight;
      case 'exit': return ArrowLeft;
      case 'detected': return Eye;
      case 'lost_track': return EyeOff;
      default: return Clock;
    }
  };

  const getEventColor = (eventType: ActivityLogType['eventType']) => {
    switch (eventType) {
      case 'entry': return 'text-success';
      case 'exit': return 'text-warning';
      case 'detected': return 'text-primary';
      case 'lost_track': return 'text-muted-foreground';
      default: return 'text-foreground';
    }
  };

  const getBadgeVariant = (eventType: ActivityLogType['eventType']) => {
    switch (eventType) {
      case 'entry': return 'default';
      case 'exit': return 'secondary';
      case 'detected': return 'outline';
      case 'lost_track': return 'secondary';
      default: return 'outline';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const groupedLogs = logs.reduce((groups, log) => {
    const dateKey = log.timestamp.toDateString();
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(log);
    return groups;
  }, {} as Record<string, ActivityLogType[]>);

  return (
    <Card className="bg-gradient-to-br from-card to-card/80">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-primary" />
          <span>Activity Log</span>
          <Badge variant="outline" className="ml-auto">
            {logs.length} events
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-[400px] w-full">
          <div className="space-y-4">
            {Object.entries(groupedLogs)
              .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
              .map(([dateKey, dayLogs]) => (
                <div key={dateKey} className="space-y-2">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="h-px bg-border flex-1" />
                    <span className="text-xs text-muted-foreground font-medium px-2">
                      {formatDate(new Date(dateKey))}
                    </span>
                    <div className="h-px bg-border flex-1" />
                  </div>
                  
                  {dayLogs
                    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                    .map((log, index) => {
                      const EventIcon = getEventIcon(log.eventType);
                      const eventColor = getEventColor(log.eventType);
                      const badgeVariant = getBadgeVariant(log.eventType);
                      
                      return (
                        <div
                          key={`${log.employeeId}-${log.timestamp.getTime()}-${index}`}
                          className="flex items-start space-x-3 p-3 rounded-lg bg-gradient-to-r from-background to-muted/10 border border-border/50 hover:border-primary/20 transition-colors"
                        >
                          <div className={`p-2 rounded-full bg-muted/30 ${eventColor}`}>
                            <EventIcon className="h-3 w-3" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold text-foreground text-sm">
                                  {log.employeeName}
                                </span>
                                <Badge variant={badgeVariant as any} className="text-xs">
                                  {log.eventType.replace('_', ' ')}
                                </Badge>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {formatTime(log.timestamp)}
                              </span>
                            </div>
                            
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <div className="flex items-center space-x-1">
                                <User className="h-3 w-3" />
                                <span>ID: {log.employeeId}</span>
                              </div>
                              
                              <div className="flex items-center space-x-1">
                                <Camera className="h-3 w-3" />
                                <span>{log.cameraIndex}</span>
                              </div>
                              
                              {log.location && (
                                <div className="flex items-center space-x-1">
                                  <span>📍 {log.location}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ))}
            
            {logs.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No activity recorded yet.</p>
                <p className="text-xs mt-1">Employee movements will appear here in real-time.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ActivityLog;