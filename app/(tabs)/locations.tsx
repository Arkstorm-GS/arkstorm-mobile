import { EmptyState } from '@/components/EmptyState';
import { EventForm } from '@/components/EventForm';
import { LocationCard } from '@/components/LocationCard';
import { StatsCard } from '@/components/StatsCard';
import { COLORS } from '@/constants/theme';
import { Event } from '@/interfaces/Event';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import {
  Calendar,
  MapPin,
  Plus,
  Zap
} from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function Locations() {
  const STORAGE_KEY = '@arkstorm:events';
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [stats, setStats] = useState({
    total: 0,
    thisMonth: 0,
    mostAffectedArea: ''
  });

  // Carrega eventos do AsyncStorage
  const loadEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const allEvents = raw ? JSON.parse(raw) as Event[] : [];
      const locationEvents = allEvents.filter(e => !!e.location);
      
      setEvents(locationEvents);
      updateStats(locationEvents);
      applyFilter(locationEvents, filterSeverity);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados.');
    } finally {
      setIsLoading(false);
    }
  }, [filterSeverity]);

  // Atualiza estatísticas
  const updateStats = (eventList: Event[]) => {
    const now = new Date();
    const thisMonth = eventList.filter(e => {
      const eventDate = new Date(e.date);
      return eventDate.getMonth() === now.getMonth() && 
             eventDate.getFullYear() === now.getFullYear();
    });

    // Área mais afetada
    const locationCount: { [key: string]: number } = {};
    eventList.forEach(e => {
      const area = e.location.split(',')[1];
      locationCount[area] = (locationCount[area] || 0) + 1;
    });
    
    const mostAffected = Object.entries(locationCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Nenhuma';


    setStats({
      total: eventList.length,
      thisMonth: thisMonth.length,
      mostAffectedArea: mostAffected,
    });
  };

  // Aplica filtro por severidade
  const applyFilter = (eventList: Event[], severity: string) => {
    if (severity === 'all') {
      setFilteredEvents(eventList);
    } else {
      setFilteredEvents(eventList.filter(e => e.severity === severity));
    }
  };

  // Carrega dados quando a tela recebe foco
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

  // Abre formulário para novo evento ou edição
  const openForm = (evt?: Event) => {
    setEditingEvent(evt);
    setModalVisible(true);
  };

  // Salva evento (novo ou editado)
  const handleSubmit = async (evt: Event) => {
    try {
      // Busca todos os eventos atuais
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const allEvents = raw ? JSON.parse(raw) as Event[] : [];
      
      let updatedEvents: Event[];
      
      if (editingEvent) {
        // Editando evento existente
        updatedEvents = allEvents.map(e => e.id === evt.id ? evt : e);
      } else {
        // Novo evento
        updatedEvents = [...allEvents, evt];
      }
      
      // Salva no AsyncStorage
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEvents));
      
      // Atualiza estado local
      const locationEvents = updatedEvents.filter(e => !!e.location);
      setEvents(locationEvents);
      updateStats(locationEvents);
      applyFilter(locationEvents, filterSeverity);
      
      setModalVisible(false);
      setEditingEvent(undefined);
      
      Alert.alert(
        'Sucesso!', 
        editingEvent ? 'Evento atualizado com sucesso!' : 'Novo evento registrado!'
      );
    } catch (error) {
      console.error('Erro ao salvar evento:', error);
      Alert.alert('Erro', 'Não foi possível salvar o evento.');
    }
  };

  // Exclui evento
  const handleDelete = (evt: Event) => {
    Alert.alert(
      'Excluir Registro',
      `Deseja realmente excluir o evento de ${evt.location}?`,
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
              
              const locationEvents = updatedEvents.filter(e => !!e.location);
              setEvents(locationEvents);
              updateStats(locationEvents);
              applyFilter(locationEvents, filterSeverity);
              
              Alert.alert('Sucesso', 'Evento excluído com sucesso!');
            } catch (error) {
              console.error('Erro ao excluir evento:', error);
              Alert.alert('Erro', 'Não foi possível excluir o evento.');
            }
          }
        }
      ]
    );
  };

  // Altera filtro de severidade
  const handleFilterChange = (severity: 'all' | 'low' | 'medium' | 'high') => {
    setFilterSeverity(severity);
    applyFilter(events, severity);
  };

  // Renderiza card de evento
  const renderEventCard = ({ item }: { item: Event }) => (
    <LocationCard
      event={item}
      onEdit={() => openForm(item)}
      onDelete={() => handleDelete(item)}
    />
  );

  // Header da lista com estatísticas
  const ListHeader = () => (
    <View style={styles.headerContainer}>

      {/* Estatísticas */}
      <View style={styles.statsContainer}>
        <StatsCard
          icon={<Zap size={20} color={COLORS.primary} />}
          label="Total de Registros"
          value={stats.total.toString()}
          color={COLORS.primary}
        />
        <StatsCard
          icon={<Calendar size={20} color="#10B981" />}
          label="Este Mês"
          value={stats.thisMonth.toString()}
          color="#10B981"
        />
      </View>

      <View style={styles.statsContainer}>
        <StatsCard
          icon={<MapPin size={20} color="#8B5CF6" />}
          label="Área Mais Atingida"
          value={stats.mostAffectedArea}
          color="#8B5CF6"
          isText
        />
      </View>

      {/* Filtros */}
      <View style={styles.filtersContainer}>
        <Text style={styles.filterLabel}>Filtrar por severidade:</Text>
        <View style={styles.filterButtons}>
          {[
            { key: 'all', label: 'Todos', color: COLORS.text },
            { key: 'low', label: 'Baixa', color: COLORS.low },
            { key: 'medium', label: 'Média', color: COLORS.medium },
            { key: 'high', label: 'Alta', color: COLORS.high }
          ].map(filter => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterButton,
                { 
                  backgroundColor: filterSeverity === filter.key 
                    ? filter.color 
                    : 'transparent',
                  borderColor: filter.color
                }
              ]}
              onPress={() => handleFilterChange(filter.key as any)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  { 
                    color: filterSeverity === filter.key 
                      ? '#FFFFFF' 
                      : filter.color
                  }
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Logo e Título */}
      <View style={styles.titleSection}>
        <View style={styles.titleText}>
          <Text style={styles.title}>Locais Afetados</Text>
          <Text style={styles.subtitle}>
            Registre e monitore áreas com falta de energia
          </Text>
        </View>
      </View>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      
      <FlatList
        data={filteredEvents}
        keyExtractor={(item) => item.id}
        renderItem={renderEventCard}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={() => (
          <EmptyState
            icon={<MapPin size={48} color={COLORS.placeholder} />}
            title="Nenhum local registrado"
            description={
              filterSeverity === 'all'
                ? "Comece registrando sua primeira ocorrência de falta de energia"
                : `Nenhum evento encontrado com severidade ${filterSeverity}`
            }
            actionText="Registrar Local"
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
        <EventForm
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
    marginTop: 8,
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