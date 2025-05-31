import { COLORS } from '@/constants/theme';
import { Event } from '@/interfaces/Event';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
   AlertTriangle,
   Building,
   Calendar,
   Clock,
   DollarSign,
   Home,
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

export const DamageCard: React.FC<Props> = ({ event, onEdit, onDelete }) => {
  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'low': return COLORS.low || '#10B981';
      case 'medium': return COLORS.medium || '#F59E0B';
      case 'high': return COLORS.high || '#EF4444';
      default: return COLORS.primary;
    }
  };

  const getDamageCategory = (damage?: string) => {
    if (!damage) return { type: 'general', icon: <AlertTriangle size={16} />, color: COLORS.placeholder };
    
    const damageText = damage.toLowerCase();
    
    if (damageText.includes('residência') || damageText.includes('casa') || 
        damageText.includes('apartamento') || damageText.includes('domicílio')) {
      return { 
        type: 'Residencial', 
        icon: <Home size={16} color="#8B5CF6" />, 
        color: '#8B5CF6' 
      };
    }
    
    if (damageText.includes('comércio') || damageText.includes('empresa') || 
        damageText.includes('loja') || damageText.includes('estabelecimento')) {
      return { 
        type: 'Comercial', 
        icon: <Building size={16} color="#F59E0B" />, 
        color: '#F59E0B' 
      };
    }
    
    if (damageText.includes('poste') || damageText.includes('fiação') || 
        damageText.includes('transformador') || damageText.includes('rede elétrica')) {
      return { 
        type: 'Infraestrutura', 
        icon: <Zap size={16} color="#EF4444" />, 
        color: '#EF4444' 
      };
    }
    
    if (damageText.includes('eletrônico') || damageText.includes('geladeira') || 
        damageText.includes('computador') || damageText.includes('alimento')) {
      return { 
        type: 'Pessoal', 
        icon: <DollarSign size={16} color="#10B981" />, 
        color: '#10B981' 
      };
    }
    
    return { 
      type: 'Geral', 
      icon: <AlertTriangle size={16} color={COLORS.placeholder} />, 
      color: COLORS.placeholder 
    };
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

  const getDamageImpact = (damage?: string, severity?: string) => {
    if (!damage) return 'Impacto não especificado';
    
    const damageText = damage.toLowerCase();
    const hasFinancialTerms = damageText.includes('prejuízo') || damageText.includes('perda') || 
                             damageText.includes('dano') || damageText.includes('custo');
    
    if (severity === 'high') {
      return hasFinancialTerms ? 'Alto impacto financeiro' : 'Danos significativos';
    } else if (severity === 'medium') {
      return hasFinancialTerms ? 'Impacto financeiro moderado' : 'Danos moderados';
    } else {
      return hasFinancialTerms ? 'Baixo impacto financeiro' : 'Danos menores';
    }
  };

  const locationInfo = formatLocation(event.location || 'Local não informado');
  const damageCategory = getDamageCategory(event.damage);
  const severityColor = getSeverityColor(event.severity);
  const impactDescription = getDamageImpact(event.damage, event.severity);

  return (
    <View style={[styles.card, { borderLeftColor: damageCategory.color }]}>
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

      {/* Categoria e Impacto */}
      <View style={styles.categorySection}>
        <View style={[styles.categoryBadge, { backgroundColor: `${damageCategory.color}15` }]}>
          {damageCategory.icon}
          <Text style={[styles.categoryText, { color: damageCategory.color }]}>
            {damageCategory.type}
          </Text>
        </View>
        <Text style={[styles.impactText, { color: severityColor }]}>
          {impactDescription}
        </Text>
      </View>

      {/* Descrição dos Prejuízos */}
      <View style={styles.damageSection}>
        <Text style={styles.damageTitle}>Prejuízos relatados:</Text>
        <Text style={styles.damageDescription} numberOfLines={3}>
          {event.damage || 'Nenhuma descrição fornecida'}
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

        {event.duration && (
          <View style={styles.infoRow}>
            <Clock size={14} color={COLORS.placeholder} />
            <Text style={styles.infoText}>
              Duração: {event.duration}
            </Text>
          </View>
        )}

        <View style={styles.infoRow}>
          <AlertTriangle size={14} color={severityColor} />
          <Text style={[styles.infoText, { color: severityColor }]}>
            Severidade {event.severity === 'low' ? 'Baixa' : 
                       event.severity === 'medium' ? 'Média' : 'Alta'}
          </Text>
        </View>
      </View>

      {/* Footer com detalhes adicionais */}
      {event.description && (
        <View style={styles.footer}>
          <Text style={styles.footerLabel}>Observações: </Text>
          <Text style={styles.footerText} numberOfLines={2}>
            {event.description}
          </Text>
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
  categorySection: {
    marginBottom: 16,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  impactText: {
    fontSize: 14,
    fontWeight: '500',
  },
  damageSection: {
    marginBottom: 16,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
  },
  damageTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  damageDescription: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
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
    lineHeight: 18,
  },
});