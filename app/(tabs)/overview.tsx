import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  StatusBar,
  Dimensions,
  StyleSheet
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { LineChart, PieChart } from 'react-native-chart-kit';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  MapPin,
  Clock,
  AlertTriangle,
  Zap,
  Calendar,
  Eye,
  Activity,
  Target,
  Award
} from 'lucide-react-native';
import { format, subDays, isAfter, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { StatsCard } from '@/components/StatsCard';
import { RecentEventCard } from '@/components/RecentEventCard';
import { InsightCard } from '@/components/InsightCard';
import { COLORS } from '@/constants/theme';
import { Event } from '@/interfaces/Event';

const STORAGE_KEY = '@arkstorm:events';
const screenWidth = Dimensions.get('window').width - 64;

export default function Overview() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Estatísticas consolidadas
  const stats = useMemo(() => {
    if (events.length === 0) {
      return {
        totalEvents: 0,
        locationsCount: 0,
        durationsCount: 0,
        damagesCount: 0,
        avgDuration: 0,
        totalDowntime: 0,
        mostAffectedArea: 'Nenhuma',
        severityDistribution: { low: 0, medium: 0, high: 0 },
        monthlyGrowth: 0,
        weeklyTrend: 'stable' as 'up' | 'down' | 'stable'
      };
    }

    // Contadores básicos
    const locationsCount = events.filter(e => !!e.location).length;
    const durationsCount = events.filter(e => !!e.duration).length;
    const damagesCount = events.filter(e => !!e.damage).length;

    // Análise de durações
    const eventsWithDuration = events.filter(e => !!e.duration);
    let totalMinutes = 0;
    eventsWithDuration.forEach(e => {
      const duration = e.duration || '';
      const hours = duration.match(/(\d+)h/);
      const minutes = duration.match(/(\d+)m/);
      totalMinutes += (hours ? parseInt(hours[1]) * 60 : 0) + (minutes ? parseInt(minutes[1]) : 0);
    });
    const avgDuration = eventsWithDuration.length > 0 ? totalMinutes / eventsWithDuration.length : 0;

    // Área mais afetada
    const locationCount: { [key: string]: number } = {};
    events.forEach(e => {
      if (e.location) {
        const area = e.location.split(',')[1].trim();
        locationCount[area] = (locationCount[area] || 0) + 1;
      }
    });
    const mostAffectedArea = Object.entries(locationCount)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'Nenhuma';

    // Distribuição de severidade
    const severityDistribution = events.reduce((acc, e) => {
      if (e.severity) {
        acc[e.severity] = (acc[e.severity] || 0) + 1;
      }
      return acc;
    }, { low: 0, medium: 0, high: 0 });

    // Crescimento mensal
    const thisMonth = events.filter(e => {
      const eventDate = new Date(e.date);
      const now = new Date();
      return eventDate >= startOfMonth(now) && eventDate <= endOfMonth(now);
    }).length;

    const lastMonth = events.filter(e => {
      const eventDate = new Date(e.date);
      const lastMonthStart = startOfMonth(subDays(new Date(), 30));
      const lastMonthEnd = endOfMonth(subDays(new Date(), 30));
      return eventDate >= lastMonthStart && eventDate <= lastMonthEnd;
    }).length;

    const monthlyGrowth = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;

    // Tendência semanal
    const lastWeek = events.filter(e =>
      isAfter(new Date(e.date), subDays(new Date(), 7))
    ).length;
    const previousWeek = events.filter(e => {
      const eventDate = new Date(e.date);
      return isAfter(eventDate, subDays(new Date(), 14)) &&
        !isAfter(eventDate, subDays(new Date(), 7));
    }).length;

    let weeklyTrend: 'up' | 'down' | 'stable' = 'stable';
    if (lastWeek > previousWeek * 1.2) weeklyTrend = 'up';
    else if (lastWeek < previousWeek * 0.8) weeklyTrend = 'down';

    return {
      totalEvents: events.length,
      locationsCount,
      durationsCount,
      damagesCount,
      avgDuration,
      totalDowntime: totalMinutes,
      mostAffectedArea,
      severityDistribution,
      monthlyGrowth,
      weeklyTrend
    };
  }, [events]);

  // Dados para gráficos
  const chartData = useMemo(() => {
    if (events.length === 0) return null;

    // Eventos por dia (últimos 15 dias)
    const last15Days = Array.from({ length: 15 }, (_, i) => {
      const date = subDays(new Date(), 14 - i);
      const eventsOnDay = events.filter(e => {
        const eventDate = new Date(e.date);
        return eventDate.toDateString() === date.toDateString();
      }).length;
      return {
        date,
        count: eventsOnDay,
        label: format(date, 'dd') // Apenas o dia
      };
    });

    // Determina o período de meses para o título
    const startDate = last15Days[0].date;
    const endDate = last15Days[last15Days.length - 1].date;
    const startMonth = format(startDate, 'MMM', { locale: ptBR });
    const endMonth = format(endDate, 'MMM', { locale: ptBR });
    const year = format(endDate, 'yyyy');

    // Monta o período para o título
    let periodText = '';
    if (startMonth === endMonth) {
      periodText = `(${startMonth}/${year})`;
    } else {
      periodText = `(${startMonth}-${endMonth}/${year})`;
    }

    const lineChartData = {
      labels: last15Days.map(d => d.label), // Apenas números dos dias
      datasets: [{
        data: last15Days.map(d => d.count),
        color: () => COLORS.primary,
        strokeWidth: 2
      }],
      periodText // Adiciona o período para usar no título
    };

    // Gráfico de pizza para severidade
    const pieData = [
      {
        name: 'Baixa',
        population: stats.severityDistribution.low,
        color: '#10B981',
        legendFontColor: '#374151',
        legendFontSize: 12,
      },
      {
        name: 'Média',
        population: stats.severityDistribution.medium,
        color: '#F59E0B',
        legendFontColor: '#374151',
        legendFontSize: 12,
      },
      {
        name: 'Alta',
        population: stats.severityDistribution.high,
        color: '#EF4444',
        legendFontColor: '#374151',
        legendFontSize: 12,
      }
    ].filter(item => item.population > 0);

    return { lineChartData, pieData };
  }, [events, stats]);

  // Insights automáticos
  const insights = useMemo(() => {
    const insightsList = [];

    if (stats.weeklyTrend === 'up') {
      insightsList.push({
        type: 'warning',
        title: 'Aumento de Eventos',
        description: 'Houve um aumento significativo de eventos na última semana.',
        icon: <TrendingUp size={20} color="#F59E0B" />
      });
    } else if (stats.weeklyTrend === 'down') {
      insightsList.push({
        type: 'success',
        title: 'Melhoria na Rede',
        description: 'Redução no número de eventos na última semana.',
        icon: <TrendingDown size={20} color="#10B981" />
      });
    }

    if (stats.avgDuration > 120) {
      insightsList.push({
        type: 'warning',
        title: 'Durações Longas',
        description: `Duração média alta: ${Math.round(stats.avgDuration)}min. Considere medidas preventivas.`,
        icon: <Clock size={20} color="#F59E0B" />
      });
    }

    if (stats.severityDistribution.high > stats.totalEvents * 0.3) {
      insightsList.push({
        type: 'alert',
        title: 'Alta Severidade',
        description: 'Muitos eventos de alta severidade registrados.',
        icon: <AlertTriangle size={20} color="#EF4444" />
      });
    }

    if (stats.mostAffectedArea !== 'Nenhuma') {
      insightsList.push({
        type: 'info',
        title: 'Área Crítica',
        description: `${stats.mostAffectedArea} é a área mais afetada por interrupções.`,
        icon: <MapPin size={20} color="#3B82F6" />
      });
    }

    return insightsList;
  }, [stats]);

  // Eventos recentes
  const recentEvents = useMemo(() => {
    return events
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [events]);

  // Carrega eventos do AsyncStorage
  const loadEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const allEvents = raw ? JSON.parse(raw) as Event[] : [];
      setEvents(allEvents);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Recarrega quando a tela ganha foco
  useFocusEffect(
    useCallback(() => {
      loadEvents();
    }, [loadEvents])
  );

  // Pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${Math.round(minutes)}min`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp size={16} color="#EF4444" />;
      case 'down': return <TrendingDown size={16} color="#10B981" />;
      default: return <Minus size={16} color="#6B7280" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return '#EF4444';
      case 'down': return '#10B981';
      default: return '#6B7280';
    }
  };

  if (events.length === 0 && !isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        >
          <View style={styles.emptyStateContainer}>
            <Image
              source={require('@/assets/images/A.png')}
              style={styles.emptyLogo}
              resizeMode="contain"
            />
            <Text style={styles.emptyTitle}>Bem-vindo ao Arkstorm</Text>
            <Text style={styles.emptySubtitle}>
              Comece registrando eventos de falta de energia para ver seu panorama geral
            </Text>
            <View style={styles.emptySteps}>
              <View style={styles.emptyStep}>
                <MapPin size={24} color={COLORS.primary} />
                <Text style={styles.emptyStepText}>Registre localizações afetadas</Text>
              </View>
              <View style={styles.emptyStep}>
                <Clock size={24} color={COLORS.primary} />
                <Text style={styles.emptyStepText}>Documente durações</Text>
              </View>
              <View style={styles.emptyStep}>
                <AlertTriangle size={24} color={COLORS.primary} />
                <Text style={styles.emptyStepText}>Relate prejuízos</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image
              source={require('@/assets/images/A.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <View>
              <Text style={styles.headerTitle}>Panorama Geral</Text>
              <Text style={styles.headerSubtitle}>
                Resumo dos eventos de falta de energia
              </Text>
            </View>
          </View>
        </View>

        {/* Estatísticas Principais */}
        <View style={styles.statsSection}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.sectionTitle}>Resumo Geral</Text>
            <View style={[styles.trendBadge, { backgroundColor: `${getTrendColor(stats.weeklyTrend)}15` }]}>
              {getTrendIcon(stats.weeklyTrend)}
              <Text style={[styles.trendText, { color: getTrendColor(stats.weeklyTrend) }]}>
                {stats.weeklyTrend === 'up' ? 'Subindo' :
                  stats.weeklyTrend === 'down' ? 'Descendo' : 'Estável'}
              </Text>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <StatsCard
              icon={<Activity size={20} color={COLORS.primary} />}
              label="Total de Eventos"
              value={stats.totalEvents.toString()}
              color={COLORS.primary}
            />
            <StatsCard
              icon={<MapPin size={20} color="#8B5CF6" />}
              label="Localizações"
              value={stats.locationsCount.toString()}
              color="#8B5CF6"
            />
          </View>

          <View style={styles.statsGrid}>
            <StatsCard
              icon={<Clock size={20} color="#F59E0B" />}
              label="Com Duração"
              value={stats.durationsCount.toString()}
              color="#F59E0B"
            />
            <StatsCard
              icon={<AlertTriangle size={20} color="#EF4444" />}
              label="Com Prejuízos"
              value={stats.damagesCount.toString()}
              color="#EF4444"
            />
          </View>

          <View style={styles.statsGrid}>
            <StatsCard
              icon={<Target size={20} color="#10B981" />}
              label="Duração Média"
              value={formatDuration(stats.avgDuration)}
              color="#10B981"
              isText
            />
            <StatsCard
              icon={<Award size={20} color="#6366F1" />}
              label="Área Crítica"
              value={stats.mostAffectedArea}
              color="#6366F1"
              isText
            />
          </View>
        </View>

        {/* Gráficos */}
        {chartData && (
          <View style={styles.chartsSection}>
            <Text style={styles.sectionTitle}>Análise Temporal</Text>

            {/* Gráfico de Linha - Eventos por Dia */}
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>
                Eventos nos Últimos 15 Dias {chartData.lineChartData.periodText}
              </Text>
              <LineChart
                data={chartData.lineChartData}
                width={screenWidth}
                height={200}
                chartConfig={{
                  backgroundColor: '#FFFFFF',
                  backgroundGradientFrom: '#FFFFFF',
                  backgroundGradientTo: '#FFFFFF',
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(228, 167, 0, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
                  style: { borderRadius: 12 },
                  propsForDots: {
                    r: '4',
                    strokeWidth: '2',
                    stroke: COLORS.primary,
                    fill: COLORS.primary
                  }
                }}
                style={styles.chart}
                bezier
              />
            </View>

            {/* Gráfico de Pizza - Distribuição de Severidade */}
            {chartData.pieData.length > 0 && (
              <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Distribuição por Severidade</Text>
                <PieChart
                  data={chartData.pieData}
                  width={screenWidth}
                  height={200}
                  chartConfig={{
                    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`
                  }}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  style={styles.chart}
                />
              </View>
            )}
          </View>
        )}

        {/* Insights */}
        {insights.length > 0 && (
          <View style={styles.insightsSection}>
            <Text style={styles.sectionTitle}>Insights Automáticos</Text>
            {insights.map((insight, index) => (
              <InsightCard
                key={index}
                type={insight.type}
                title={insight.title}
                description={insight.description}
                icon={insight.icon}
              />
            ))}
          </View>
        )}

        {/* Eventos Recentes */}
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>5 Últimos Eventos Adicionados</Text>

          {recentEvents.map((event, index) => (
            <RecentEventCard key={event.id || index} event={event} />
          ))}
        </View>

        {/* Métricas de Performance */}
        <View style={styles.performanceSection}>
          <Text style={styles.sectionTitle}>Métricas de Impacto</Text>

          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Zap size={24} color="#F59E0B" />
              <Text style={styles.metricTitle}>Tempo Total de Interrupção</Text>
            </View>
            <Text style={styles.metricValue}>
              {formatDuration(stats.totalDowntime)}
            </Text>
            <Text style={styles.metricSubtext}>
              Acumulado em {stats.durationsCount} eventos
            </Text>
          </View>

          {stats.monthlyGrowth !== 0 && (
            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Calendar size={24} color={stats.monthlyGrowth > 0 ? '#EF4444' : '#10B981'} />
                <Text style={styles.metricTitle}>Variação Mensal</Text>
              </View>
              <Text style={[
                styles.metricValue,
                { color: stats.monthlyGrowth > 0 ? '#EF4444' : '#10B981' }
              ]}>
                {stats.monthlyGrowth > 0 ? '+' : ''}{stats.monthlyGrowth.toFixed(1)}%
              </Text>
              <Text style={styles.metricSubtext}>
                Em relação ao mês anterior
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logo: {
    width: 32,
    height: 32,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.placeholder,
    lineHeight: 18,
  },
  headerRight: {
    marginLeft: 12,
  },
  trendBadge: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  statsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  chartsSection: {
    padding: 20,
    paddingTop: 0,
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 12,
  },
  insightsSection: {
    padding: 20,
    paddingTop: 0,
  },
  recentSection: {
    padding: 20,
    paddingTop: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    color: COLORS.primary,
    marginLeft: 4,
    fontWeight: '500',
  },
  performanceSection: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: 40,
  },
  metricCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 12,
  },
  metricValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  metricSubtext: {
    fontSize: 14,
    color: COLORS.placeholder,
  },
  // Empty State
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    minHeight: 400,
  },
  emptyLogo: {
    width: 80,
    height: 80,
    marginBottom: 24,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: COLORS.placeholder,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emptySteps: {
    width: '100%',
    gap: 16,
  },
  emptyStep: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyStepText: {
    fontSize: 16,
    color: COLORS.text,
    marginLeft: 16,
    fontWeight: '500',
  },
});