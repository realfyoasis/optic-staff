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
  const onlinePercentage = totalEmployees > 0 ? Math.round((onlineEmployees / totalEmployees) * 100) : 0;
  const feedUptime = totalFeeds > 0 ? Math.round((activeFeeds / totalFeeds) * 100) : 0;

  const stats = [
    {
      title: 'Total Employees',
      value: totalEmployees,
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      change: '+2.5%',
      changeType: 'positive' as const,
    },
    {
      title: 'Online Now',
      value: onlineEmployees,
      icon: UserCheck,
      color: 'text-success',
      bgColor: 'bg-success/10',
      subtitle: `${onlinePercentage}% present`,
      change: '+12.3%',
      changeType: 'positive' as const,
    },
    {
      title: 'Offline',
      value: offlineEmployees,
      icon: UserX,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted',
      subtitle: 'Not detected',
      change: '-5.1%',
      changeType: 'negative' as const,
    },
    {
      title: 'Active Alerts',
      value: totalIncidents,
      icon: AlertTriangle,
      color: totalIncidents > 0 ? 'text-destructive' : 'text-success',
      bgColor: totalIncidents > 0 ? 'bg-destructive/10' : 'bg-success/10',
      subtitle: totalIncidents > 0 ? 'Requires attention' : 'All clear',
      change: totalIncidents > 0 ? '+100%' : '0%',
      changeType: totalIncidents > 0 ? 'negative' as const : 'neutral' as const,
    },
    {
      title: 'Camera Feeds',
      value: activeFeeds,
      icon: Camera,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      subtitle: `${feedUptime}% uptime`,
      change: '+0.2%',
      changeType: 'positive' as const,
    },
    {
      title: 'System Health',
      value: 98,
      icon: Shield,
      color: 'text-success',
      bgColor: 'bg-success/10',
      subtitle: 'Operational',
      suffix: '%',
      change: '+1.2%',
      changeType: 'positive' as const,
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      {stats.map((stat) => {
        const IconComponent = stat.icon;
        
        return (
          <Card key={stat.title} className="bg-gradient-to-br from-card to-card/80 border transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <IconComponent className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-1">
                <div className="flex items-baseline space-x-1">
                  <div className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </div>
                  {stat.suffix && (
                    <span className="text-lg text-muted-foreground">{stat.suffix}</span>
                  )}
                </div>
                
                {stat.subtitle && (
                  <p className="text-xs text-muted-foreground">
                    {stat.subtitle}
                  </p>
                )}
                
                <div className="flex items-center space-x-1">
                  <TrendingUp className={`h-3 w-3 ${getChangeColor(stat.changeType)}`} />
                  <span className={`text-xs ${getChangeColor(stat.changeType)}`}>
                    {stat.change}
                  </span>
                  <span className="text-xs text-muted-foreground">vs last month</span>
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