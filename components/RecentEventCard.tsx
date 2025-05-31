import { COLORS } from '@/constants/theme';
import { Event } from '@/interfaces/Event';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  AlertTriangle,
  ChevronRight,
  Clock,
  DollarSign,
  MapPin
} from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  event: Event;
  onPress?: () => void;
}

export const RecentEventCard: React.FC<Props> = ({ event, onPress }) => {
  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'low': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'high': return '#EF4444';
      default: return COLORS.placeholder;
    }
  };

  const getSeverityLabel = (severity?: string) => {
    switch (severity) {
      case 'low': return 'Baixa';
      case 'medium': return 'Média';
      case 'high': return 'Alta';
      default: return 'N/A';
    }
  };

  const getEventType = (event: Event) => {
    if (event.damage) return { type: 'Prejuízo', icon: <DollarSign size={14} />, color: '#EF4444' };
    if (event.duration) return { type: 'Duração', icon: <Clock size={14} />, color: '#F59E0B' };
    if (event.location) return { type: 'Localização', icon: <MapPin size={14} />, color: '#8B5CF6' };
    return { type: 'Evento', icon: <AlertTriangle size={14} />, color: COLORS.placeholder };
  };

  const formatLocation = (location?: string) => {
    if (!location) return 'Local não informado';
    const parts = location.split(',');
    return parts[0].trim();
  };

  const eventType = getEventType(event);
  const severityColor = getSeverityColor(event.severity);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.typeIndicator, { backgroundColor: `${eventType.color}15` }]}>
            <Text style={[styles.typeText, { color: eventType.color }]}>
              {eventType.type}
            </Text>
          </View>
          <Text style={styles.date}>
            {format(new Date(event.date), 'dd MMM', { locale: ptBR })}
          </Text>
        </View>

        {/* Main Info */}
        <View style={styles.mainInfo}>
          <View style={styles.locationInfo}>
            <MapPin size={16} color={COLORS.text} />
            <Text style={styles.locationText}>
              {formatLocation(event.location)}
            </Text>
          </View>

          {event.severity && (
            <View style={[styles.severityBadge, { borderColor: severityColor }]}>
              <Text style={[styles.severityText, { color: severityColor }]}>
                {getSeverityLabel(event.severity)}
              </Text>
            </View>
          )}
        </View>

        {/* Additional Info */}
        <View style={styles.additionalInfo}>
          {event.duration && (
            <View style={styles.infoItem}>
              <Clock size={14} color={COLORS.placeholder} />
              <Text style={styles.infoText}>{event.duration}</Text>
            </View>
          )}

          {event.damage && (
            <View style={styles.infoItem}>
              <DollarSign size={14} color={COLORS.placeholder} />
              <Text style={styles.infoText} numberOfLines={1}>
                {event.damage.length > 30 ? `${event.damage.substring(0, 30)}...` : event.damage}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeIcon: {
    marginRight: 4,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  date: {
    fontSize: 12,
    color: COLORS.placeholder,
    fontWeight: '500',
  },
  mainInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginLeft: 6,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
  },
  severityText: {
    fontSize: 11,
    fontWeight: '600',
  },
  additionalInfo: {
    gap: 4,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 13,
    color: COLORS.placeholder,
    marginLeft: 6,
    flex: 1,
  },
});