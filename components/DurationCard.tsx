import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
   Clock,
   MapPin,
   Calendar,
   Timer,
   AlertTriangle,
   Pencil,
   Trash2,
   Zap
} from 'lucide-react-native';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { COLORS } from '@/constants/theme';
import { Event } from '@/interfaces/Event';

interface Props {
   event: Event;
   onEdit?: () => void;
   onDelete?: () => void;
}

export const DurationCard: React.FC<Props> = ({ event, onEdit, onDelete }) => {
   const getSeverityColor = (severity?: string) => {
      switch (severity) {
         case 'low': return COLORS.low || '#10B981';
         case 'medium': return COLORS.medium || '#F59E0B';
         case 'high': return COLORS.high || '#EF4444';
         default: return COLORS.primary;
      }
   };

   const formatLocation = (location: string) => {
      const parts = location.split(',');
      if (parts.length >= 2) {
         return {
            main: parts[0].trim(),
            secondary: parts.slice(1).join(',').trim()
         };
      }
      return { main: location, secondary: '' };
   };

   const formatDurationDetails = (duration?: string) => {
      if (!duration) return { display: 'Não informado', category: 'Curta' };

      const hours = duration.match(/(\d+)h/);
      const minutes = duration.match(/(\d+)m/);
      const totalHours = hours ? parseInt(hours[1]) : 0;
      const totalMinutes = minutes ? parseInt(minutes[1]) : 0;

      let category = 'Curta';
      if (totalHours >= 8) category = 'Muito Longa';
      else if (totalHours >= 4) category = 'Longa';
      else if (totalHours >= 1) category = 'Média';

      return { display: duration, category };
   };

   const locationInfo = formatLocation(event.location || 'Local não informado');
   const durationInfo = formatDurationDetails(event.duration);
   const severityColor = getSeverityColor(event.severity);

   return (
      <View style={[styles.card, { borderLeftColor: severityColor }]}>
         {/* Header */}
         <View style={styles.cardHeader}>
            <View style={styles.locationSection}>
               <View style={styles.locationMain}>
                  <MapPin size={16} color={severityColor} />
                  <Text style={styles.locationText}>{locationInfo.main}</Text>
               </View>
               {locationInfo.secondary && (
                  <Text style={styles.locationSecondary}>{locationInfo.secondary}</Text>
               )}
            </View>

            <View style={styles.actions}>
               {onEdit && (
                  <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
                     <Pencil size={16} color={COLORS.placeholder} />
                  </TouchableOpacity>
               )}
               {onDelete && (
                  <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
                     <Trash2 size={16} color={COLORS.placeholder} />
                  </TouchableOpacity>
               )}
            </View>
         </View>

         {/* Duração Destacada */}
         <View style={styles.durationSection}>
            <View style={[styles.durationBadge, { backgroundColor: `${severityColor}15` }]}>
               <Timer size={20} color={severityColor} />
               <Text style={[styles.durationText, { color: severityColor }]}>
                  {durationInfo.display}
               </Text>
            </View>
            <Text style={[styles.durationCategory, { color: severityColor }]}>
               {durationInfo.category}
            </Text>
         </View>

         {/* Informações do Evento */}
         <View style={styles.eventInfo}>
            <View style={styles.infoRow}>
               <Calendar size={14} color={COLORS.placeholder} />
               <Text style={styles.infoText}>
                  {format(new Date(event.date), "dd 'de' MMM, yyyy", { locale: ptBR })}
               </Text>
            </View>

            {event.severity && (
               <View style={styles.infoRow}>
                  <AlertTriangle size={14} color={severityColor} />
                  <Text style={[styles.infoText, { color: severityColor }]}>
                     Severidade {event.severity === 'low' ? 'Baixa' :
                        event.severity === 'medium' ? 'Média' : 'Alta'}
                  </Text>
               </View>
            )}

            {event.description && (
               <View style={styles.infoRow}>
                  <Zap size={14} color={COLORS.placeholder} />
                  <Text style={styles.description} numberOfLines={2}>
                     {event.description}
                  </Text>
               </View>
            )}
         </View>

         {/* Footer com impacto estimado */}
         {event.damage && (
            <View style={styles.footer}>
               <Text style={styles.footerLabel}>Prejuízo: </Text>
               <Text style={styles.footerText}>{event.damage}</Text>
            </View>
         )}
      </View>
   );
};

const styles = StyleSheet.create({
   card: {
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      padding: 16,
      marginHorizontal: 16,
      marginVertical: 8,
      borderLeftWidth: 4,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
   },
   cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
   },
   locationSection: {
      flex: 1,
   },
   locationMain: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
   },
   locationText: {
      fontSize: 16,
      fontWeight: '600',
      color: COLORS.text,
      marginLeft: 6,
   },
   locationSecondary: {
      fontSize: 14,
      color: COLORS.placeholder,
      marginLeft: 22,
   },
   actions: {
      flexDirection: 'row',
      gap: 8,
   },
   actionButton: {
      padding: 4,
   },
   durationSection: {
      alignItems: 'center',
      marginBottom: 16,
   },
   durationBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      marginBottom: 4,
   },
   durationText: {
      fontSize: 18,
      fontWeight: 'bold',
      marginLeft: 6,
   },
   durationCategory: {
      fontSize: 12,
      fontWeight: '500',
      textTransform: 'uppercase',
   },
   eventInfo: {
      gap: 8,
   },
   infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
   },
   infoText: {
      fontSize: 14,
      color: COLORS.text,
   },
   description: {
      fontSize: 14,
      color: COLORS.placeholder,
      flex: 1,
      lineHeight: 18,
   },
   footer: {
      flexDirection: 'row',
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: '#F3F4F6',
   },
   footerLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: COLORS.text,
   },
   footerText: {
      fontSize: 14,
      color: COLORS.placeholder,
      flex: 1,
   },
});