import { ChartTypeSelector } from '@/components/ChartTypeSelector';
import { DurationCard } from '@/components/DurationCard';
import { DurationForm } from '@/components/DurationForm';
import { EmptyState } from '@/components/EmptyState';
import { StatsCard } from '@/components/StatsCard';
import { COLORS } from '@/constants/theme';
import { Event } from '@/interfaces/Event';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format, isAfter, subDays } from 'date-fns';
import { useFocusEffect } from 'expo-router';
import {
  AlertCircle,
  BarChart3,
  Clock,
  Plus,
  Timer,
  TrendingUp,
  Zap
} from 'lucide-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Modal,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const STORAGE_KEY = '@arkstorm:events';
const screenWidth = Dimensions.get('window').width - 32;

type ChartType = 'line' | 'column' | 'weekly';
type TimeFilter = '7d' | '30d' | '90d' | 'all';

export default function Duration() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [chartType, setChartType] = useState<ChartType>('line');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('30d');

  // Converte string de duração para minutos
  const parseDuration = (duration: string): number => {
    const hours = duration.match(/(\d+)h/);
    const minutes = duration.match(/(\d+)m/);
    return (hours ? parseInt(hours[1]) * 60 : 0) + (minutes ? parseInt(minutes[1]) : 0);
  };

  // Formata minutos para string legível
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  // Estatísticas calculadas
  const stats = useMemo(() => {
    if (filteredEvents.length === 0) {
      return {
        totalEvents: 0,
        avgDuration: 0,
        totalDowntime: 0,
        longestOutage: 0,
        shortestOutage: 0,
        trend: 'stable' as 'up' | 'down' | 'stable'
      };
    }

    const durations = filteredEvents
      .map(e => parseDuration(e.duration || '0'))
      .filter(d => d > 0);

    const totalDowntime = durations.reduce((sum, d) => sum + d, 0);
    const avgDuration = totalDowntime / durations.length;
    const longestOutage = Math.max(...durations);
    const shortestOutage = Math.min(...durations);

    // Calcular tendência (últimos 7 dias vs 7 dias anteriores)
    const now = new Date();
    const last7Days = filteredEvents.filter(e => 
      isAfter(new Date(e.date), subDays(now, 7))
    );
    const previous7Days = filteredEvents.filter(e => {
      const eventDate = new Date(e.date);
      return isAfter(eventDate, subDays(now, 14)) && 
             !isAfter(eventDate, subDays(now, 7));
    });

    const recentAvg = last7Days.length > 0 
      ? last7Days.reduce((sum, e) => sum + parseDuration(e.duration || '0'), 0) / last7Days.length
      : 0;
    const previousAvg = previous7Days.length > 0
      ? previous7Days.reduce((sum, e) => sum + parseDuration(e.duration || '0'), 0) / previous7Days.length
      : 0;

    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (recentAvg > previousAvg * 1.1) trend = 'up';
    else if (recentAvg < previousAvg * 0.9) trend = 'down';

    return {
      totalEvents: filteredEvents.length,
      avgDuration,
      totalDowntime,
      longestOutage,
      shortestOutage,
      trend
    };
  }, [filteredEvents]);

  

  // Aplica filtro de tempo
  const applyTimeFilter = useCallback((eventList: Event[], filter: TimeFilter) => {
    if (filter === 'all') {
      setFilteredEvents(eventList);
      return;
    }

    const days = filter === '7d' ? 7 : filter === '30d' ? 30 : 90;
    const cutoffDate = subDays(new Date(), days);
    
    const filtered = eventList.filter(e => 
      isAfter(new Date(e.date), cutoffDate)
    );
    
    setFilteredEvents(filtered);
  }, []);

  // Carrega eventos do AsyncStorage
  const loadEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const allEvents = raw ? JSON.parse(raw) as Event[] : [];
      const durationEvents = allEvents.filter(e => !!e.duration);
      
      setEvents(durationEvents);
      applyTimeFilter(durationEvents, timeFilter);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados.');
    } finally {
      setIsLoading(false);
    }
  }, [timeFilter, applyTimeFilter]);

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

  // Abre formulário
  const openForm = (evt?: Event) => {
    setEditingEvent(evt);
    setModalVisible(true);
  };

  // Salva evento
  const handleSubmit = async (evt: Event) => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const allEvents = raw ? JSON.parse(raw) as Event[] : [];
      
      let updatedEvents: Event[];
      if (editingEvent) {
        updatedEvents = allEvents.map(e => e.id === evt.id ? evt : e);
      } else {
        updatedEvents = [...allEvents, evt];
      }
      
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEvents));
      
      const durationEvents = updatedEvents.filter(e => !!e.duration);
      setEvents(durationEvents);
      applyTimeFilter(durationEvents, timeFilter);
      
      setModalVisible(false);
      setEditingEvent(undefined);
      
      Alert.alert(
        'Sucesso!',
        editingEvent ? 'Duração atualizada!' : 'Nova duração registrada!'
      );
    } catch (error) {
      console.error('Erro ao salvar:', error);
      Alert.alert('Erro', 'Não foi possível salvar os dados.');
    }
  };

  // Exclui evento
  const handleDelete = (evt: Event) => {
    Alert.alert(
      'Excluir Registro',
      `Deseja remover o registro de duração de ${evt.location}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              const raw = await AsyncStorage.getItem(STORAGE_KEY);
              const allEvents = raw ? JSON.parse(raw) as Event[] : [];
              const updatedEvents = allEvents.filter(e => e.id !== evt.id);
              
              await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEvents));
              
              const durationEvents = updatedEvents.filter(e => !!e.duration);
              setEvents(durationEvents);
              applyTimeFilter(durationEvents, timeFilter);
              
              Alert.alert('Sucesso', 'Registro excluído!');
            } catch (error) {
              console.error('Erro ao excluir:', error);
              Alert.alert('Erro', 'Não foi possível excluir o registro.');
            }
          }
        }
      ]
    );
  };

  // Altera filtro de tempo
  const handleTimeFilterChange = (filter: TimeFilter) => {
    setTimeFilter(filter);
    applyTimeFilter(events, filter);
  };

  // Prepara dados para o gráfico
  const chartData = useMemo(() => {
    if (filteredEvents.length === 0) return null;

    const sorted = filteredEvents
      .map(e => ({
        date: new Date(e.date),
        duration: parseDuration(e.duration || '0'),
        event: e
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    if (chartType === 'weekly') {
      // Agrupa por semana
      const weeklyData: { [key: string]: number[] } = {};
      sorted.forEach(item => {
        const weekKey = format(item.date, 'yyyy-ww');
        if (!weeklyData[weekKey]) weeklyData[weekKey] = [];
        weeklyData[weekKey].push(item.duration);
      });

      const labels = Object.keys(weeklyData).map(week => {
        const year = week.split('-')[0];
        const weekNum = week.split('-')[1];
        return `S${weekNum}`;
      });

      const data = Object.values(weeklyData).map(durations => 
        durations.reduce((sum, d) => sum + d, 0) / durations.length
      );

      return { labels, data };
    }

    const labels = sorted.map(item => format(item.date, 'dd/MM'));
    const data = sorted.map(item => item.duration);

    return { labels, data };
  }, [filteredEvents, chartType]);

  // Renderiza card de evento
  const renderEventCard = ({ item }: { item: Event }) => (
    <DurationCard
      event={item}
      onEdit={() => openForm(item)}
      onDelete={() => handleDelete(item)}
    />
  );

  // Header da lista
  const ListHeader = () => (
    <View style={styles.headerContainer}>
      {/* Estatísticas */}
      <View style={styles.statsContainer}>
        <StatsCard
          icon={<Zap size={20} color={COLORS.primary} />}
          label="Total de Registros"
          value={stats.totalEvents.toString()}
          color={COLORS.primary}
        />
        <StatsCard
          icon={<Timer size={20} color="#10B981" />}
          label="Duração Média"
          value={formatDuration(Math.round(stats.avgDuration))}
          color="#10B981"
          isText
        />
      </View>

      <View style={styles.statsContainer}>
        <StatsCard
          icon={<AlertCircle size={20} color="#EF4444" />}
          label="Maior Interrupção"
          value={formatDuration(stats.longestOutage)}
          color="#EF4444"
          isText
        />
        <StatsCard
          icon={<TrendingUp size={20} color={
            stats.trend === 'up' ? '#EF4444' : 
            stats.trend === 'down' ? '#10B981' : '#6B7280'
          } />}
          label="Tendência"
          value={
            stats.trend === 'up' ? 'Aumentando' :
            stats.trend === 'down' ? 'Diminuindo' : 'Estável'
          }
          color={
            stats.trend === 'up' ? '#EF4444' : 
            stats.trend === 'down' ? '#10B981' : '#6B7280'
          }
          isText
        />
      </View>

      {/* Filtros de Tempo */}
      <View style={styles.filtersContainer}>
        <Text style={styles.filterLabel}>Período:</Text>
        <View style={styles.filterButtons}>
          {[
            { key: '7d', label: '7 dias' },
            { key: '30d', label: '30 dias' },
            { key: '90d', label: '90 dias' },
            { key: 'all', label: 'Todos' }
          ].map(filter => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterButton,
                { 
                  backgroundColor: timeFilter === filter.key 
                    ? COLORS.primary 
                    : 'transparent',
                  borderColor: COLORS.primary
                }
              ]}
              onPress={() => handleTimeFilterChange(filter.key as TimeFilter)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  { 
                    color: timeFilter === filter.key 
                      ? '#FFFFFF' 
                      : COLORS.primary
                  }
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Seletor de Tipo de Gráfico */}
      <ChartTypeSelector
        selectedType={chartType}
        onTypeChange={setChartType}
      />

      {/* Gráfico */}
      {chartData && chartData.data.length > 0 ? (
        <View style={styles.chartContainer}>
          <LineChart
            data={{
              labels: chartData.labels,
              datasets: [{ 
                data: chartData.data,
                color: () => COLORS.primary,
                strokeWidth: 2
              }],
            }}
            width={screenWidth - 32}
            height={220}
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
              },
              propsForBackgroundLines: {
                strokeDasharray: '',
                stroke: '#E5E7EB',
                strokeWidth: 1
              }
            }}
            style={styles.chart}
            bezier
          />
          <View style={styles.chartFooter}>
            <Text style={styles.chartFooterText}>
              Duração em minutos • {chartType === 'weekly' ? 'Média semanal' : 'Por evento'}
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.noChartContainer}>
          <BarChart3 size={48} color={COLORS.placeholder} />
          <Text style={styles.noChartText}>
            Registre durações para ver o gráfico
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      
      {/* Logo e Título */}
      <View style={styles.titleSection}>
        <View style={styles.titleText}>
          <Text style={styles.title}>Tempo de Interrupção</Text>
          <Text style={styles.subtitle}>
            Monitore a duração dos eventos de falta de energia
          </Text>
        </View>
      </View>

      <FlatList
        data={filteredEvents}
        keyExtractor={(item) => item.id}
        renderItem={renderEventCard}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={() => (
          <EmptyState
            icon={<Clock size={48} color={COLORS.placeholder} />}
            title="Nenhuma duração registrada"
            description={
              timeFilter === 'all'
                ? "Comece registrando o tempo de duração de uma interrupção"
                : `Nenhum evento encontrado nos últimos ${timeFilter.replace('d', ' dias')}`
            }
            actionText="Registrar Duração"
            onAction={() => openForm()}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Botão Flutuante */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => openForm()}
        activeOpacity={0.8}
      >
        <Plus color="#FFFFFF" size={24} />
      </TouchableOpacity>

      {/* Modal do Formulário */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setModalVisible(false)}
      >
        <DurationForm
          initialEvent={editingEvent}
          onSubmit={handleSubmit}
          onCancel={() => {
            setModalVisible(false);
            setEditingEvent(undefined);
          }}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  logo: {
    width: 32,
    height: 32,
    marginRight: 12,
  },
  titleText: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.placeholder,
    lineHeight: 18,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  filtersContainer: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 8,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 12,
  },
  chartFooter: {
    alignItems: 'center',
    marginTop: 8,
  },
  chartFooterText: {
    fontSize: 12,
    color: COLORS.placeholder,
  },
  noChartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  noChartText: {
    fontSize: 14,
    color: COLORS.placeholder,
    marginTop: 12,
    textAlign: 'center',
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});