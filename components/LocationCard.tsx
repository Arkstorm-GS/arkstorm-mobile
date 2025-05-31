import { COLORS } from '@/constants/theme';
import { Event } from '@/interfaces/Event';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
   AlertTriangle,
   Calendar,
   Clock,
   MapPin,
   Pencil,
   Trash2,
   Zap
} from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
   event: Event;
   onEdit?: () => void;
   onDelete?: () => void;
}

export const LocationCard: React.FC<Props> = ({ event, onEdit, onDelete }) => {
   const getSeverityColor = (severity?: string) => {
      switch (severity) {
         case 'low': return COLORS.low || '#10B981';
         case 'medium': return COLORS.medium || '#F59E0B';
         case 'high': return COLORS.high || '#EF4444';
         default: return COLORS.primary;
      }
   };

   const getSeverityLabel = (severity?: string) => {
      switch (severity) {
         case 'low': return 'Baixa';
         case 'medium': return 'Média';
         case 'high': return 'Alta';
         default: return 'Não definida';
      }
   };

   const formatLocation = (location: string) => {
      const parts = location.split(',');
      if (parts.length >= 2) {
         const neighborhood = parts[0].trim();
         const city = parts[1].trim();
         return { neighborhood, city, full: location };
      }
      return { neighborhood: location, city: '', full: location };
   };

   const locationInfo = formatLocation(event.location);
   const severityColor = getSeverityColor(event.severity);

   return (
      <View style={[styles.card, { borderLeftColor: severityColor }]}>
         {/* Header do Card */}
         <View style={styles.cardHeader}>
            <View style={styles.locationInfo}>
               <View style={styles.locationMain}>
                  <MapPin size={16} color={severityColor} />
                  <Text style={styles.neighborhood}>{locationInfo.neighborhood}</Text>
               </View>
               {locationInfo.city && (
                  <Text style={styles.city}>{locationInfo.city}</Text>
               )}
            </View>

            {/* Badge de Severidade */}
            <View style={[styles.severityBadge, { backgroundColor: `${severityColor}20` }]}>
               <Text style={[styles.severityText, { color: severityColor }]}>
                  {getSeverityLabel(event.severity).toUpperCase()}
               </Text>
            </View>
         </View>

         {/* Informações do Evento */}
         <View style={styles.eventInfo}>
            <View style={styles.infoRow}>
               <Calendar size={14} color={COLORS.placeholder} />
               <Text style={styles.infoText}>
                  {format(new Date(event.date), "dd 'de' MMM, yyyy", { locale: ptBR })}
               </Text>
            </View>

            <View style={styles.infoRow}>
               <AlertTriangle size={14} color={severityColor} />
               <Text style={[styles.infoText, { color: severityColor }]}>
                  Severidade {getSeverityLabel(event.severity)}
               </Text>
            </View>

            {event.duration && (
               <View style={styles.infoRow}>
                  <Clock size={14} color={COLORS.placeholder} />
                  <Text style={styles.infoText}>
                     Duração: {event.duration}
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

         {/* Ações do Card */}
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
   );
};

const styles = StyleSheet.create({
   card: {
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      padding: 16,
      marginHorizontal: 16,
      marginVertical: 6,
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
   locationInfo: {
      flex: 1,
   },
   locationMain: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
   },
   neighborhood: {
      fontSize: 16,
      fontWeight: '600',
      color: COLORS.text,
      marginLeft: 6,
   },
   city: {
      fontSize: 14,
      color: COLORS.placeholder,
      marginLeft: 22,
   },
   actions: {
      position: 'absolute',
      bottom: 12,
      right: 12,
      flexDirection: 'row',
      gap: 8,
   },
   actionButton: {
      backgroundColor: '#F3F4F6',
      borderRadius: 8,
      padding: 10,
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
   severityBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
   },
   severityText: {
      fontSize: 10,
      fontWeight: '600',
   },
});