import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  UserCheck, 
  UserX, 
  AlertTriangle, 
  Camera, 
  Activity,
  TrendingUp,
  Shield
} from 'lucide-react';

interface StatsCardsProps {
  totalEmployees: number;
  onlineEmployees: number;
  offlineEmployees: number;
  totalIncidents: number;
  activeFeeds: number;
  totalFeeds: number;
}

const StatsCards = ({ 
  totalEmployees, 
  onlineEmployees, 
  offlineEmployees, 
  totalIncidents,
  activeFeeds,
  totalFeeds
}: StatsCardsProps) => {
  const stats = [
    {
      title: 'Active Employees',
      value: onlineEmployees,
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-blue-50',
      change: '+2 from yesterday',
      changeType: 'positive' as const,
    },
    {
      title: 'Active Cameras',
      value: `${activeFeeds}/${totalFeeds}`,
      icon: Camera,
      color: 'text-primary',
      bgColor: 'bg-blue-50',
      subtitle: `${totalFeeds - activeFeeds} offline`,
      changeType: 'neutral' as const,
    },
    {
      title: 'Incidents',
      value: totalIncidents,
      icon: AlertTriangle,
      color: totalIncidents > 0 ? 'text-destructive' : 'text-primary',
      bgColor: totalIncidents > 0 ? 'bg-red-50' : 'bg-blue-50',
      subtitle: totalIncidents > 0 ? 'Requires attention' : undefined,
      changeType: 'neutral' as const,
    },
    {
      title: 'System Status',
      value: 'Operational',
      icon: Shield,
      color: 'text-success',
      bgColor: 'bg-green-50',
      subtitle: '99.8% uptime',
      changeType: 'positive' as const,
      isText: true,
    },
  ];

  const getChangeColor = (type: 'positive' | 'negative' | 'neutral') => {
    switch (type) {
      case 'positive': return 'text-success';
      case 'negative': return 'text-destructive';
      case 'neutral': return 'text-muted-foreground';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const IconComponent = stat.icon;
        
        return (
          <Card key={stat.title} className="bg-white border shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    {stat.title}
                  </p>
                  
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-foreground">
                      {stat.isText ? stat.value : stat.value}
                    </div>
                    
                    {stat.subtitle && (
                      <p className={`text-sm ${
                        stat.title === 'Incidents' && totalIncidents > 0 
                          ? 'text-destructive' 
                          : stat.title === 'Active Cameras' && (totalFeeds - activeFeeds) > 0
                          ? 'text-muted-foreground'
                          : 'text-muted-foreground'
                      }`}>
                        {stat.subtitle}
                      </p>
                    )}
                    
                    {stat.change && (
                      <p className="text-sm text-success">
                        {stat.change}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <IconComponent className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default StatsCards;