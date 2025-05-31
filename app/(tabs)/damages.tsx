import { CategorySelector } from '@/components/CategorySelector';
import { DamageCard } from '@/components/DamageCard';
import { DamageForm } from '@/components/DamageForm';
import { EmptyState } from '@/components/EmptyState';
import { StatsCard } from '@/components/StatsCard';
import { COLORS } from '@/constants/theme';
import { Event } from '@/interfaces/Event';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isAfter, subDays } from 'date-fns';
import { useFocusEffect } from 'expo-router';
import {
  AlertTriangle,
  Building,
  Home,
  Plus,
  TrendingUp,
  Users
} from 'lucide-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const STORAGE_KEY = '@arkstorm:events';

type DamageCategory = 'all' | 'residential' | 'commercial' | 'infrastructure' | 'personal';
type TimeFilter = '7d' | '30d' | '90d' | 'all';

export default function Damages() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<DamageCategory>('all');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('30d');

  // Estatísticas calculadas
  const stats = useMemo(() => {
    if (filteredEvents.length === 0) {
      return {
        totalEvents: 0,
        residentialCount: 0,
        commercialCount: 0,
        avgSeverity: 'low' as 'low' | 'medium' | 'high',
        trend: 'stable' as 'up' | 'down' | 'stable'
      };
    }

    // Contagem por categoria
    const residential = filteredEvents.filter(e => 
      e.damage?.toLowerCase().includes('residência') || 
      e.damage?.toLowerCase().includes('casa') ||
      e.damage?.toLowerCase().includes('apartamento') ||
      e.damage?.toLowerCase().includes('domicílio')
    ).length;

    const commercial = filteredEvents.filter(e => 
      e.damage?.toLowerCase().includes('comércio') || 
      e.damage?.toLowerCase().includes('empresa') ||
      e.damage?.toLowerCase().includes('loja') ||
      e.damage?.toLowerCase().includes('estabelecimento')
    ).length;

    // Severidade média
    const severities = filteredEvents.map(e => e.severity);
    const severityWeights = { low: 1, medium: 2, high: 3 };
    const avgWeight = severities.reduce((sum, sev) => 
      sum + (severityWeights[sev as keyof typeof severityWeights] || 2), 0
    ) / severities.length;
    
    let avgSeverity: 'low' | 'medium' | 'high' = 'medium';
    if (avgWeight < 1.5) avgSeverity = 'low';
    else if (avgWeight > 2.5) avgSeverity = 'high';

    // Tendência
    const now = new Date();
    const recent = filteredEvents.filter(e => 
      isAfter(new Date(e.date), subDays(now, 7))
    ).length;
    const previous = filteredEvents.filter(e => {
      const eventDate = new Date(e.date);
      return isAfter(eventDate, subDays(now, 14)) && 
             !isAfter(eventDate, subDays(now, 7));
    }).length;

    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (recent > previous * 1.2) trend = 'up';
    else if (recent < previous * 0.8) trend = 'down';

    return {
      totalEvents: filteredEvents.length,
      residentialCount: residential,
      commercialCount: commercial,
      avgSeverity,
      trend
    };
  }, [filteredEvents]);

  // Aplica filtros
  const applyFilters = useCallback((eventList: Event[], category: DamageCategory, time: TimeFilter) => {
    let filtered = eventList;

    // Filtro por tempo
    if (time !== 'all') {
      const days = time === '7d' ? 7 : time === '30d' ? 30 : 90;
      const cutoffDate = subDays(new Date(), days);
      filtered = filtered.filter(e => isAfter(new Date(e.date), cutoffDate));
    }

    // Filtro por categoria
    if (category !== 'all') {
      filtered = filtered.filter(e => {
        if (!e.damage) return false;
        const damage = e.damage.toLowerCase();
        
        switch (category) {
          case 'residential':
            return damage.includes('residência') || damage.includes('casa') || 
                   damage.includes('apartamento') || damage.includes('domicílio');
          case 'commercial':
            return damage.includes('comércio') || damage.includes('empresa') || 
                   damage.includes('loja') || damage.includes('estabelecimento');
          case 'infrastructure':
            return damage.includes('poste') || damage.includes('fiação') || 
                   damage.includes('transformador') || damage.includes('rede elétrica');
          case 'personal':
            return damage.includes('eletrônico') || damage.includes('geladeira') || 
                   damage.includes('computador') || damage.includes('alimento');
          default:
            return true;
        }
      });
    }

    setFilteredEvents(filtered);
  }, []);

  // Carrega eventos do AsyncStorage
  const loadEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const allEvents = raw ? JSON.parse(raw) as Event[] : [];
      const damageEvents = allEvents.filter(e => !!e.damage);
      
      setEvents(damageEvents);
      applyFilters(damageEvents, categoryFilter, timeFilter);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados.');
    } finally {
      setIsLoading(false);
    }
  }, [categoryFilter, timeFilter, applyFilters]);

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
      
      const damageEvents = updatedEvents.filter(e => !!e.damage);
      setEvents(damageEvents);
      applyFilters(damageEvents, categoryFilter, timeFilter);
      
      setModalVisible(false);
      setEditingEvent(undefined);
      
      Alert.alert(
        'Sucesso!',
        editingEvent ? 'Prejuízo atualizado!' : 'Novo prejuízo registrado!'
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
      `Deseja remover o registro de prejuízo de ${evt.location}?`,
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
              
              const damageEvents = updatedEvents.filter(e => !!e.damage);
              setEvents(damageEvents);
              applyFilters(damageEvents, categoryFilter, timeFilter);
              
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

  // Altera filtro de categoria
  const handleCategoryChange = (category: DamageCategory) => {
    setCategoryFilter(category);
    applyFilters(events, category, timeFilter);
  };

  // Altera filtro de tempo
  const handleTimeFilterChange = (time: TimeFilter) => {
    setTimeFilter(time);
    applyFilters(events, categoryFilter, time);
  };

  // Renderiza card de evento
  const renderEventCard = ({ item }: { item: Event }) => (
    <DamageCard
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
          icon={<AlertTriangle size={20} color={COLORS.primary} />}
          label="Total de Registros"
          value={stats.totalEvents.toString()}
          color={COLORS.primary}
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

      <View style={styles.statsContainer}>
        <StatsCard
          icon={<Home size={20} color="#8B5CF6" />}
          label="Danos Residenciais"
          value={stats.residentialCount.toString()}
          color="#8B5CF6"
        />
        <StatsCard
          icon={<Building size={20} color="#F59E0B" />}
          label="Danos Comerciais"
          value={stats.commercialCount.toString()}
          color="#F59E0B"
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

      {/* Seletor de Categoria */}
      <CategorySelector
        selectedCategory={categoryFilter}
        onCategoryChange={handleCategoryChange}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      {/* Logo e Título */}
      <View style={styles.titleSection}>
        <View style={styles.titleText}>
          <Text style={styles.title}>Prejuízos Causados</Text>
          <Text style={styles.subtitle}>
            Registre e monitore os danos causados pelas interrupções
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
            icon={<AlertTriangle size={48} color={COLORS.placeholder} />}
            title="Nenhum prejuízo registrado"
            description={
              categoryFilter === 'all' && timeFilter === 'all'
                ? "Comece registrando os primeiros prejuízos causados por interrupções"
                : `Nenhum prejuízo encontrado para os filtros selecionados`
            }
            actionText="Registrar Prejuízo"
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
        <DamageForm
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