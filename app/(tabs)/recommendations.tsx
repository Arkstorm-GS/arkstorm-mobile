import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  StatusBar,
  Share,
  Alert,
  StyleSheet
} from 'react-native';
import { 
  Lightbulb, 
  Battery, 
  Radio, 
  Phone, 
  Home, 
  AlertTriangle, 
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Zap,
  Shield,
  Clock,
  Users,
  Heart,
  Share2,
  Star,
  Download,
  Bookmark,
  Info
} from 'lucide-react-native';
import { COLORS } from '@/constants/theme';

export default function Recommendations() {
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const toggleCard = (cardId: number) => {
    setExpandedCard(expandedCard === cardId ? null : cardId);
  };

  const toggleFavorite = (cardId: number) => {
    setFavorites(prev => 
      prev.includes(cardId) 
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Simula refresh de dados
    setTimeout(() => setRefreshing(false), 1000);
  };

  const shareRecommendation = async (recommendation: any) => {
    try {
      const message = `📱 Arkstorm - ${recommendation.title}\n\n` +
        recommendation.items.map((item: string, index: number) => 
          `${index + 1}. ${item}`
        ).join('\n') +
        '\n\n🔗 Baixe o Arkstorm para mais dicas de emergência!';
      
      await Share.share({
        message,
        title: `Recomendações: ${recommendation.title}`
      });
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  };

  const exportAllRecommendations = async () => {
    try {
      const allRecommendations = recommendations.map(rec => 
        `🔹 ${rec.title}\n${rec.items.map((item, i) => `  ${i + 1}. ${item}`).join('\n')}`
      ).join('\n\n');

      const message = `📱 ARKSTORM - Guia Completo de Emergências\n\n${allRecommendations}\n\n` +
        '📞 CONTATOS DE EMERGÊNCIA:\n• Bombeiros: 193\n• Defesa Civil: 199\n• Companhia Elétrica: 0800-xxx-xxxx';

      await Share.share({
        message,
        title: 'Arkstorm - Guia de Emergências'
      });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível exportar as recomendações.');
    }
  };

  const recommendations = [
    {
      id: 1,
      title: "Kit de Emergência",
      icon: <Lightbulb size={24} color="#F59E0B" />,
      color: "#F59E0B",
      priority: "Alta",
      category: "Preparação",
      items: [
        "Lanternas LED com pilhas extras ou recarregáveis",
        "Velas e fósforos à prova d'água em recipiente lacrado",
        "Rádio portátil a pilha com função de carregador solar",
        "Power bank de alta capacidade (20.000mAh ou mais)",
        "Pilhas de diversos tamanhos (AA, AAA, D)",
        "Kit de primeiros socorros completo e atualizado",
        "Lanterna de cabeça (mãos livres)",
        "Sinalizadores luminosos ou bastões químicos"
      ]
    },
    {
      id: 2,
      title: "Alimentação e Água",
      icon: <Home size={24} color="#10B981" />,
      color: "#10B981",
      priority: "Crítica",
      category: "Sobrevivência",
      items: [
        "Reserve 4 litros de água por pessoa/dia (mínimo 3 dias)",
        "Alimentos não perecíveis: enlatados, biscoitos, granola",
        "Abrelatas manual e utensílios básicos",
        "Fogão portátil a gás ou álcool com combustível",
        "Purificador ou filtro de água portátil",
        "Sal, açúcar e temperos básicos",
        "Leite em pó, café solúvel, achocolatado",
        "Alimentos para bebês e pets (se necessário)"
      ]
    },
    {
      id: 3,
      title: "Comunicação",
      icon: <Phone size={24} color="#3B82F6" />,
      color: "#3B82F6",
      priority: "Alta",
      category: "Conectividade",
      items: [
        "Mantenha celulares sempre carregados (acima de 80%)",
        "Lista de contatos impressa (família, emergência, vizinhos)",
        "Rádio AM/FM para informações oficiais",
        "Apps de emergência instalados e configurados",
        "Carregador veicular e solar para dispositivos",
        "Walkie-talkie para comunicação local",
        "Apito de emergência para sinalização",
        "Cópias de documentos em pendrive"
      ]
    },
    {
      id: 4,
      title: "Segurança Elétrica",
      icon: <Zap size={24} color="#DC2626" />,
      color: "#DC2626",
      priority: "Crítica",
      category: "Prevenção",
      items: [
        "Desligue aparelhos da tomada antes da tempestade",
        "Use filtros de linha com proteção contra surtos",
        "Evite equipamentos eletrônicos durante tempestades",
        "NUNCA toque em fios caídos ou danificados",
        "Mantenha gerador em área ventilada (nunca dentro de casa)",
        "Inspeção elétrica anual por profissional qualificado",
        "Aterramento adequado da instalação elétrica",
        "Disjuntores DR funcionando corretamente"
      ]
    },
    {
      id: 5,
      title: "Saúde e Bem-estar",
      icon: <Heart size={24} color="#EC4899" />,
      color: "#EC4899",
      priority: "Alta",
      category: "Cuidados",
      items: [
        "Medicamentos essenciais (30 dias de reserva)",
        "Termômetro digital e medidor de pressão",
        "Álcool gel, máscaras e luvas descartáveis",
        "Produtos de higiene pessoal básicos",
        "Sabonete antibacteriano e papel higiênico",
        "Fraldas e produtos para bebês (se necessário)",
        "Óculos sobressalentes e lentes de contato",
        "Documentos médicos e receitas em local seguro"
      ]
    }
  ];

  const quickTips = [
    {
      icon: <Battery size={20} color="#059669" />,
      text: "Mantenha dispositivos sempre carregados",
      action: "Carregue diariamente"
    },
    {
      icon: <AlertTriangle size={20} color="#D97706" />,
      text: "Monitore alertas meteorológicos",
      action: "Configure notificações"
    },
    {
      icon: <Clock size={20} color="#7C3AED" />,
      text: "Tenha um plano de emergência familiar",
      action: "Pratique regularmente"
    },
    {
      icon: <Users size={20} color="#DC2626" />,
      text: "Identifique vizinhos que podem precisar de ajuda",
      action: "Mantenha contato"
    },
    {
      icon: <Shield size={20} color={COLORS.primary} />,
      text: "Atualize seu kit de emergência semestralmente",
      action: "Defina lembretes"
    }
  ];

  const emergencyContacts = [
    {
      service: "Bombeiros",
      number: "193",
      description: "Incêndios, resgates e emergências médicas",
      available: "24h",
      icon: <AlertTriangle size={20} color="#DC2626" />
    },
    {
      service: "Defesa Civil",
      number: "199",
      description: "Desastres naturais e emergências climáticas",
      available: "24h",
      icon: <Shield size={20} color="#059669" />
    },
    {
      service: "Companhia Elétrica",
      number: "0800-701-0102",
      description: "Falta de energia e problemas na rede",
      available: "24h",
      icon: <Zap size={20} color="#F59E0B" />
    },
    {
      service: "SAMU",
      number: "192",
      description: "Emergências médicas e primeiros socorros",
      available: "24h",
      icon: <Heart size={20} color="#EF4444" />
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Crítica': return '#DC2626';
      case 'Alta': return '#F59E0B';
      case 'Média': return '#059669';
      default: return COLORS.placeholder;
    }
  };

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
          <View style={styles.headerTop}>
            <Image 
              source={require('@/assets/images/A.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
            <View style={styles.headerActions}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={exportAllRecommendations}
              >
                <Share2 size={20} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Recomendações</Text>
            <Text style={styles.headerSubtitle}>
              Orientações preventivas para enfrentar emergências elétricas
            </Text>
            <View style={styles.headerStats}>
              <View style={styles.statItem}>
                <Star size={16} color={COLORS.primary} />
                <Text style={styles.statText}>{recommendations.length} guias</Text>
              </View>
              <View style={styles.statItem}>
                <Heart size={16} color="#EF4444" />
                <Text style={styles.statText}>{favorites.length} favoritos</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Tips */}
        <View style={styles.quickTipsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Dicas Essenciais</Text>
            <Info size={16} color={COLORS.placeholder} />
          </View>
          {quickTips.map((tip, index) => (
            <View key={index} style={styles.quickTip}>
              <View style={styles.quickTipIcon}>
                {tip.icon}
              </View>
              <View style={styles.quickTipContent}>
                <Text style={styles.quickTipText}>{tip.text}</Text>
                <Text style={styles.quickTipAction}>{tip.action}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Main Recommendations */}
        <View style={styles.recommendationsContainer}>
          <Text style={styles.sectionTitle}>Guia Completo de Preparação</Text>
          {recommendations.map((rec) => (
            <View key={rec.id} style={styles.card}>
              <TouchableOpacity
                style={[styles.cardHeader, { borderLeftColor: rec.color }]}
                onPress={() => toggleCard(rec.id)}
                activeOpacity={0.7}
              >
                <View style={styles.cardHeaderLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: `${rec.color}15` }]}>
                    {rec.icon}
                  </View>
                  <View style={styles.cardTitleContainer}>
                    <Text style={styles.cardTitle}>{rec.title}</Text>
                    <View style={styles.cardMeta}>
                      <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(rec.priority) }]}>
                        <Text style={styles.priorityText}>{rec.priority}</Text>
                      </View>
                      <Text style={styles.categoryText}>{rec.category}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity 
                    onPress={(e) => {
                      e.stopPropagation();
                      toggleFavorite(rec.id);
                    }}
                    style={styles.favoriteButton}
                  >
                    <Heart 
                      size={18} 
                      color={favorites.includes(rec.id) ? "#EF4444" : COLORS.placeholder}
                      fill={favorites.includes(rec.id) ? "#EF4444" : "transparent"}
                    />
                  </TouchableOpacity>
                  {expandedCard === rec.id ? (
                    <ChevronUp size={20} color="#374151" />
                  ) : (
                    <ChevronDown size={20} color="#374151" />
                  )}
                </View>
              </TouchableOpacity>

              {expandedCard === rec.id && (
                <View style={styles.cardContent}>
                  <View style={styles.cardContentHeader}>
                    <Text style={styles.itemsCount}>
                      {rec.items.length} itens essenciais
                    </Text>
                    <TouchableOpacity 
                      onPress={() => shareRecommendation(rec)}
                      style={styles.shareButton}
                    >
                      <Share2 size={16} color={COLORS.primary} />
                      <Text style={styles.shareText}>Compartilhar</Text>
                    </TouchableOpacity>
                  </View>
                  {rec.items.map((item, index) => (
                    <View key={index} style={styles.listItem}>
                      <CheckCircle size={16} color={rec.color} />
                      <Text style={styles.listItemText}>{item}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Emergency Contacts */}
        <View style={styles.emergencyContainer}>
          <Text style={styles.sectionTitle}>Contatos de Emergência</Text>
          <View style={styles.emergencyCard}>
            {emergencyContacts.map((contact, index) => (
              <TouchableOpacity 
                key={index}
                style={[
                  styles.emergencyItem,
                  index < emergencyContacts.length - 1 && styles.emergencyItemBorder
                ]}
                onPress={() => {
                  Alert.alert(
                    contact.service,
                    `Ligar para ${contact.number}?\n\n${contact.description}`,
                    [
                      { text: 'Cancelar', style: 'cancel' },
                      { text: 'Ligar', onPress: () => console.log(`Ligando para ${contact.number}`) }
                    ]
                  );
                }}
              >
                <View style={styles.emergencyIconContainer}>
                  {contact.icon}
                </View>
                <View style={styles.emergencyInfo}>
                  <View style={styles.emergencyTitleRow}>
                    <Text style={styles.emergencyTitle}>{contact.service}</Text>
                    <View style={styles.availabilityBadge}>
                      <Text style={styles.availabilityText}>{contact.available}</Text>
                    </View>
                  </View>
                  <Text style={styles.emergencyNumber}>{contact.number}</Text>
                  <Text style={styles.emergencyDescription}>{contact.description}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Safety Footer */}
        <View style={styles.footer}>
          <View style={styles.footerIcon}>
            <AlertTriangle size={24} color="#D97706" />
          </View>
          <View style={styles.footerContent}>
            <Text style={styles.footerTitle}>Lembre-se</Text>
            <Text style={styles.footerText}>
              Em emergências, mantenha a calma e siga as orientações das autoridades. 
              Pratique seu plano de emergência regularmente com a família.
            </Text>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
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
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 32,
    height: 32,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.primary}10`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.placeholder,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  headerStats: {
    flexDirection: 'row',
    gap: 24,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  quickTipsContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
  },
  quickTip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  quickTipIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  quickTipContent: {
    flex: 1,
  },
  quickTipText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
    lineHeight: 18,
  },
  quickTipAction: {
    fontSize: 12,
    color: COLORS.placeholder,
    marginTop: 2,
  },
  recommendationsContainer: {
    padding: 20,
    paddingTop: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderLeftWidth: 4,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  categoryText: {
    fontSize: 12,
    color: COLORS.placeholder,
    fontWeight: '500',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  favoriteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  cardContentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  itemsCount: {
    fontSize: 14,
    color: COLORS.placeholder,
    fontWeight: '500',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: `${COLORS.primary}10`,
    borderRadius: 16,
  },
  shareText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingLeft: 8,
  },
  listItemText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    marginLeft: 12,
    lineHeight: 22,
  },
  emergencyContainer: {
    padding: 20,
    paddingTop: 8,
  },
  emergencyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emergencyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 20,
  },
  emergencyItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  emergencyIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  emergencyInfo: {
    flex: 1,
  },
  emergencyTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  availabilityBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  availabilityText: {
    fontSize: 11,
    color: '#065F46',
    fontWeight: '600',
  },
  emergencyNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#DC2626',
    marginBottom: 4,
  },
  emergencyDescription: {
    fontSize: 14,
    color: COLORS.placeholder,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 20,
    backgroundColor: '#FEF3C7',
    margin: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  footerIcon: {
    marginRight: 16,
    marginTop: 2,
  },
  footerContent: {
    flex: 1,
  },
  footerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 4,
  },
  footerText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 20,
  },
});