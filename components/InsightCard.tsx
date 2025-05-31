import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
   TrendingUp,
   TrendingDown,
   AlertTriangle,
   Info,
   CheckCircle,
   Lightbulb,
   MapPin,
   Clock,
   X
} from 'lucide-react-native';
import { COLORS } from '@/constants/theme';

interface Props {
   type: string;
   title: string;
   description: string;
   icon?: React.ReactNode;
   onDismiss?: () => void;
   onAction?: () => void;
   actionText?: string;
   priority?: 'low' | 'medium' | 'high';
   trend?: 'up' | 'down' | 'stable';
}

export const InsightCard: React.FC<Props> = ({
   type,
   title,
   description,
   icon,
   onDismiss,
   onAction,
   actionText,
   priority = 'medium',
   trend
}) => {
   const getTypeStyles = (type: string, priority: string = 'medium') => {
      switch (type) {
         case 'success':
            return {
               backgroundColor: '#ECFDF5',
               borderColor: '#10B981',
               titleColor: '#065F46',
               descriptionColor: '#047857',
               iconBgColor: '#D1FAE5',
               defaultIcon: <CheckCircle size={20} color="#10B981" />
            };
         case 'warning':
            return {
               backgroundColor: '#FFFBEB',
               borderColor: '#F59E0B',
               titleColor: '#92400E',
               descriptionColor: '#B45309',
               iconBgColor: '#FEF3C7',
               defaultIcon: <AlertTriangle size={20} color="#F59E0B" />
            };
         case 'alert':
            const alertIntensity = priority === 'high' ?
               { bg: '#FEF2F2', border: '#EF4444', title: '#991B1B', desc: '#DC2626', iconBg: '#FEE2E2' } :
               { bg: '#FFF5F5', border: '#F56565', title: '#C53030', desc: '#E53E3E', iconBg: '#FED7D7' };
            return {
               backgroundColor: alertIntensity.bg,
               borderColor: alertIntensity.border,
               titleColor: alertIntensity.title,
               descriptionColor: alertIntensity.desc,
               iconBgColor: alertIntensity.iconBg,
               defaultIcon: <AlertTriangle size={20} color={alertIntensity.border} />
            };
         case 'trend':
            const trendColor = trend === 'up' ? '#EF4444' : trend === 'down' ? '#10B981' : '#6B7280';
            const trendIcon = trend === 'up' ?
               <TrendingUp size={20} color={trendColor} /> :
               trend === 'down' ?
                  <TrendingDown size={20} color={trendColor} /> :
                  <Info size={20} color={trendColor} />;
            return {
               backgroundColor: `${trendColor}08`,
               borderColor: trendColor,
               titleColor: trendColor,
               descriptionColor: trendColor,
               iconBgColor: `${trendColor}15`,
               defaultIcon: trendIcon
            };
         case 'info':
         default:
            return {
               backgroundColor: '#EFF6FF',
               borderColor: '#3B82F6',
               titleColor: '#1E40AF',
               descriptionColor: '#2563EB',
               iconBgColor: '#DBEAFE',
               defaultIcon: <Info size={20} color="#3B82F6" />
            };
      }
   };

   const typeStyles = getTypeStyles(type, priority);
   const displayIcon = icon || typeStyles.defaultIcon;

   const getPriorityIndicator = () => {
      if (priority === 'high') {
         return (
            <View style={[styles.priorityDot, { backgroundColor: '#EF4444' }]} />
         );
      } else if (priority === 'medium') {
         return (
            <View style={[styles.priorityDot, { backgroundColor: '#F59E0B' }]} />
         );
      }
      return null;
   };

   return (
      <View style={[
         styles.container,
         {
            backgroundColor: typeStyles.backgroundColor,
            borderColor: typeStyles.borderColor
         }
      ]}>
         {/* Header */}
         <View style={styles.header}>
            <View style={styles.headerLeft}>
               <View style={[
                  styles.iconContainer,
                  { backgroundColor: typeStyles.iconBgColor }
               ]}>
                  {displayIcon}
               </View>
               <View style={styles.titleContainer}>
                  <View style={styles.titleRow}>
                     {getPriorityIndicator()}
                     <Text style={[
                        styles.title,
                        { color: typeStyles.titleColor }
                     ]}>
                        {title}
                     </Text>
                  </View>
                  {type === 'trend' && trend && (
                     <Text style={[styles.trendLabel, { color: typeStyles.titleColor }]}>
                        {trend === 'up' ? 'Tendência de alta' :
                           trend === 'down' ? 'Tendência de baixa' :
                              'Situação estável'}
                     </Text>
                  )}
               </View>
            </View>

            {onDismiss && (
               <TouchableOpacity
                  onPress={onDismiss}
                  style={styles.dismissButton}
               >
                  <X size={18} color={typeStyles.descriptionColor} />
               </TouchableOpacity>
            )}
         </View>

         {/* Content */}
         <Text style={[
            styles.description,
            { color: typeStyles.descriptionColor }
         ]}>
            {description}
         </Text>

         {/* Action Button */}
         {onAction && actionText && (
            <TouchableOpacity
               style={[
                  styles.actionButton,
                  { borderColor: typeStyles.borderColor }
               ]}
               onPress={onAction}
            >
               <Text style={[
                  styles.actionText,
                  { color: typeStyles.titleColor }
               ]}>
                  {actionText}
               </Text>
            </TouchableOpacity>
         )}

         {/* Footer com timestamp ou informações extras */}
         {type === 'trend' && (
            <View style={styles.footer}>
               <Clock size={12} color={typeStyles.descriptionColor} />
               <Text style={[styles.footerText, { color: typeStyles.descriptionColor }]}>
                  Análise baseada nos últimos 7 dias
               </Text>
            </View>
         )}
      </View>
   );
};

const styles = StyleSheet.create({
   container: {
      borderRadius: 16,
      borderWidth: 1,
      padding: 16,
      marginBottom: 12,
      elevation: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
   },
   header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
   },
   headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
   },
   iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
   },
   titleContainer: {
      flex: 1,
   },
   titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 2,
   },
   priorityDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 8,
   },
   title: {
      fontSize: 16,
      fontWeight: '600',
      flex: 1,
   },
   trendLabel: {
      fontSize: 12,
      fontWeight: '500',
      opacity: 0.8,
   },
   dismissButton: {
      padding: 4,
   },
   description: {
      fontSize: 14,
      lineHeight: 20,
      marginBottom: 12,
   },
   actionButton: {
      alignSelf: 'flex-start',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      marginTop: 4,
   },
   actionText: {
      fontSize: 14,
      fontWeight: '500',
   },
   footer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
      opacity: 0.7,
   },
   footerText: {
      fontSize: 11,
      marginLeft: 4,
      fontStyle: 'italic',
   },
});