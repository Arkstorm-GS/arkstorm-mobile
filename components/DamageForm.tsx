import React, { useEffect, useState } from 'react';
import {
   View,
   Text,
   TextInput,
   TouchableOpacity,
   ScrollView,
   KeyboardAvoidingView,
   Platform,
   Alert,
   Image,
   StatusBar,
   FlatList,
   Animated
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
   Calendar,
   MapPin,
   AlertTriangle,
   DollarSign,
   X,
   Info,
   ChevronDown,
   Search,
   CheckCircle,
   Home,
   Building,
   Zap,
   Package,
   Plus,
   Minus,
   Lightbulb,
   TrendingUp
} from 'lucide-react-native';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import uuid from 'react-native-uuid';
import { Event } from '@/interfaces/Event';
import { DamageTemplate } from '@/interfaces/DamageTemplate';
import { COLORS } from '@/constants/theme';
import { StyleSheet } from 'react-native';

interface Props {
   initialEvent?: Event;
   onSubmit: (event: Event) => void;
   onCancel: () => void;
}

export const DamageForm: React.FC<Props> = ({
   initialEvent,
   onSubmit,
   onCancel
}) => {
   const [date, setDate] = useState(
      initialEvent?.date || new Date().toISOString()
   );
   const [showPicker, setShowPicker] = useState(false);
   const [location, setLocation] = useState(
      initialEvent?.location || ''
   );
   const [damage, setDamage] = useState(
      initialEvent?.damage || ''
   );
   const [description, setDescription] = useState(
      initialEvent?.description || ''
   );
   const [severity, setSeverity] = useState<'low' | 'medium' | 'high'>(
      initialEvent?.severity || 'medium'
   );

   // Estados para seleção de localização
   const [availableLocations, setAvailableLocations] = useState<string[]>([]);
   const [locationEvents, setLocationEvents] = useState<{ [key: string]: Event }>({});
   const [showLocationPicker, setShowLocationPicker] = useState(false);
   const [locationSearch, setLocationSearch] = useState('');
   const [filteredLocations, setFilteredLocations] = useState<string[]>([]);

   // Estados para sugestões
   const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
   const [activeCategory, setActiveCategory] = useState<string | null>(null);

   const damageTemplates: DamageTemplate[] = [
      {
         id: 'residential',
         category: 'Residencial',
         icon: <Home size={16} color="#8B5CF6" />,
         color: '#8B5CF6',
         items: [
            'Geladeira danificada por surto elétrico',
            'Alimentos estragados na geladeira/freezer',
            'Aparelhos eletrônicos queimados',
            'Sistema de segurança desativado',
            'Medicamentos refrigerados perdidos',
            'Computador/notebook danificado',
            'TV e equipamentos de som afetados',
            'Micro-ondas e eletrodomésticos queimados'
         ]
      },
      {
         id: 'commercial',
         category: 'Comercial',
         icon: <Building size={16} color="#F59E0B" />,
         color: '#F59E0B',
         items: [
            'Produtos perecíveis perdidos no estoque',
            'Equipamentos comerciais danificados',
            'Interrupção total das vendas',
            'Sistema de pagamento indisponível',
            'Perda de clientes durante o período',
            'Equipamentos de refrigeração comercial',
            'Sistemas de ar condicionado afetados',
            'Computadores e servidores danificados'
         ]
      },
      {
         id: 'infrastructure',
         category: 'Infraestrutura',
         icon: <Zap size={16} color="#EF4444" />,
         color: '#EF4444',
         items: [
            'Poste de energia caído/danificado',
            'Transformador queimado',
            'Cabos e fiação comprometidos',
            'Equipamentos da rede elétrica afetados',
            'Sistemas de iluminação pública',
            'Semáforos fora de funcionamento'
         ]
      },
      {
         id: 'personal',
         category: 'Bens Pessoais',
         icon: <Package size={16} color="#10B981" />,
         color: '#10B981',
         items: [
            'Celular/tablet danificado',
            'Carregadores e cabos queimados',
            'Perda de dados importantes',
            'Equipamentos de trabalho afetados',
            'Instrumentos musicais eletrônicos',
            'Equipamentos de exercício elétricos'
         ]
      }
   ];

   // Carrega localizações disponíveis com dados dos eventos
   useEffect(() => {
      loadAvailableLocations();
   }, []);

   const loadAvailableLocations = async () => {
      try {
         const raw = await AsyncStorage.getItem('@arkstorm:events');
         const allEvents = raw ? JSON.parse(raw) as Event[] : [];

         const locationsWithEvents: { [key: string]: Event } = {};

         allEvents
            .filter(e => !!e.location)
            .forEach(event => {
               if (!locationsWithEvents[event.location] ||
                  new Date(event.date) > new Date(locationsWithEvents[event.location].date)) {
                  locationsWithEvents[event.location] = event;
               }
            });

         const locations = Object.keys(locationsWithEvents).sort();

         setAvailableLocations(locations);
         setLocationEvents(locationsWithEvents);
         setFilteredLocations(locations);
      } catch (error) {
         console.error('Erro ao carregar localizações:', error);
      }
   };

   // Filtra localizações conforme a busca
   useEffect(() => {
      if (!locationSearch.trim()) {
         setFilteredLocations(availableLocations);
      } else {
         const filtered = availableLocations.filter(loc =>
            loc.toLowerCase().includes(locationSearch.toLowerCase())
         );
         setFilteredLocations(filtered);
      }
   }, [locationSearch, availableLocations]);


   const handleLocationSelect = (selectedLocation: string) => {
      setLocation(selectedLocation);

      // Preenche dados automaticamente se não for edição
      const eventData = locationEvents[selectedLocation];
      if (eventData && !initialEvent) {
         setDate(eventData.date);
         setSeverity(eventData.severity || 'medium');
      }

      setShowLocationPicker(false);
      setLocationSearch('');
   };

   const toggleTemplate = (templateText: string) => {
      setSelectedTemplates(prev => {
         if (prev.includes(templateText)) {
            // Remove template
            const newDamage = damage
               .split('\n')
               .filter((line: string) => !line.trim().endsWith(templateText))
               .join('\n')
               .trim();
            setDamage(newDamage);
            return prev.filter(t => t !== templateText);
         } else {
            // Adiciona template
            const newTemplate = `• ${templateText}`;
            const newDamage = damage.trim()
               ? `${damage}\n${newTemplate}`
               : newTemplate;
            setDamage(newDamage);
            return [...prev, templateText];
         }
      });
   };

   const onChangeDate = (_: any, selectedDate?: Date) => {
      setShowPicker(Platform.OS === 'ios');
      if (selectedDate) {
         setDate(selectedDate.toISOString());
      }
   };

   const handleSubmit = () => {
      // Validações
      if (!location.trim()) {
         Alert.alert('Campo obrigatório', 'Por favor, selecione uma localização.');
         return;
      }

      if (!availableLocations.includes(location)) {
         Alert.alert(
            'Localização inválida',
            'Por favor, selecione uma localização da lista de locais já cadastrados.'
         );
         return;
      }

      if (!damage.trim()) {
         Alert.alert('Campo obrigatório', 'Por favor, descreva os prejuízos causados.');
         return;
      }

      const event: Event = {
         id: initialEvent?.id ?? String(uuid.v4()),
         date,
         location: location.trim(),
         damage: damage.trim(),
         description: description.trim() || undefined,
         severity,
         latitude: initialEvent?.latitude,
         longitude: initialEvent?.longitude,
      };

      onSubmit(event);
   };

   const getSeverityColor = (sev: string) => {
      switch (sev) {
         case 'low': return '#10B981';
         case 'medium': return '#F59E0B';
         case 'high': return '#EF4444';
         default: return COLORS.primary;
      }
   };

   const getSeverityLabel = (sev: string) => {
      switch (sev) {
         case 'low': return 'Baixa';
         case 'medium': return 'Média';
         case 'high': return 'Alta';
         default: return 'Média';
      }
   };

   return (
      <KeyboardAvoidingView
         style={styles.container}
         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
         <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

         {/* Header */}
         <View style={styles.header}>
            <View style={styles.headerLeft}>
               <Image
                  source={require('@/assets/images/A.png')}
                  style={styles.logo}
                  resizeMode="contain"
               />
               <View>
                  <Text style={styles.headerTitle}>
                     {initialEvent ? 'Editar Prejuízo' : 'Novo Prejuízo'}
                  </Text>
                  <Text style={styles.headerSubtitle}>
                     Registre os danos causados pela interrupção
                  </Text>
               </View>
            </View>
            <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
               <X size={24} color={COLORS.text} />
            </TouchableOpacity>
         </View>

         <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Data */}
            <View style={styles.inputGroup}>
               <Text style={styles.label}>Data do Evento</Text>
               <TouchableOpacity
                  style={styles.inputRow}
                  onPress={() => setShowPicker(true)}
               >
                  <Calendar color={COLORS.primary} size={20} />
                  <Text style={styles.inputText}>
                     {format(new Date(date), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                  </Text>
               </TouchableOpacity>
            </View>

            {showPicker && (
               <DateTimePicker
                  value={new Date(date)}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onChangeDate}
                  maximumDate={new Date()}
               />
            )}

            {/* Localização */}
            <View style={styles.inputGroup}>
               <Text style={styles.label}>Localização *</Text>
               {availableLocations.length === 0 ? (
                  <View style={styles.noLocationsContainer}>
                     <MapPin color={COLORS.placeholder} size={48} />
                     <Text style={styles.noLocationsTitle}>Nenhuma localização cadastrada</Text>
                     <Text style={styles.noLocationsText}>
                        Você precisa cadastrar localizações na aba "Locais" antes de registrar prejuízos.
                     </Text>
                     <TouchableOpacity
                        style={styles.goToLocationsButton}
                        onPress={() => {
                           Alert.alert(
                              'Cadastrar Localização',
                              'Vá para a aba "Locais Afetados" para cadastrar uma nova localização primeiro.',
                              [{ text: 'Entendi', onPress: onCancel }]
                           );
                        }}
                     >
                        <Text style={styles.goToLocationsText}>Ir para Localizações</Text>
                     </TouchableOpacity>
                  </View>
               ) : (
                  <>
                     <TouchableOpacity
                        style={styles.inputRow}
                        onPress={() => setShowLocationPicker(true)}
                     >
                        <MapPin color={COLORS.primary} size={20} />
                        <Text style={[
                           styles.inputText,
                           { color: location ? COLORS.text : COLORS.placeholder }
                        ]}>
                           {location || 'Selecione uma localização cadastrada'}
                        </Text>
                        <ChevronDown color={COLORS.placeholder} size={20} />
                     </TouchableOpacity>

                     {locationEvents[location] && !initialEvent && (
                        <View style={styles.autoFillInfo}>
                           <Info size={14} color={COLORS.primary} />
                           <Text style={styles.autoFillText}>
                              Dados preenchidos automaticamente
                           </Text>
                        </View>
                     )}

                  </>
               )}
            </View>

            {/* Severidade */}
            <View style={styles.inputGroup}>
               <Text style={styles.label}>Nível de Severidade</Text>
               <View style={styles.severityContainer}>
                  {(['low', 'medium', 'high'] as const).map((level) => (
                     <TouchableOpacity
                        key={level}
                        style={[
                           styles.severityButton,
                           {
                              backgroundColor: severity === level
                                 ? getSeverityColor(level)
                                 : 'transparent',
                              borderColor: getSeverityColor(level)
                           }
                        ]}
                        onPress={() => setSeverity(level)}
                     >
                        <AlertTriangle
                           size={16}
                           color={severity === level ? '#FFFFFF' : getSeverityColor(level)}
                        />
                        <Text
                           style={[
                              styles.severityText,
                              {
                                 color: severity === level
                                    ? '#FFFFFF'
                                    : getSeverityColor(level)
                              }
                           ]}
                        >
                           {getSeverityLabel(level)}
                        </Text>
                     </TouchableOpacity>
                  ))}
               </View>
            </View>

            {/* Descrição dos Prejuízos */}
            <View style={styles.inputGroup}>
               <Text style={styles.label}>Descrição dos Prejuízos *</Text>
               <View style={styles.inputRow}>
                  <TextInput
                     style={[styles.input, styles.textArea]}
                     placeholder="Descreva detalhadamente os prejuízos causados..."
                     placeholderTextColor={COLORS.placeholder}
                     value={damage}
                     onChangeText={setDamage}
                     multiline
                     numberOfLines={6}
                     textAlignVertical="top"
                  />
               </View>
               <View style={styles.damageInfo}>
                  <Info size={14} color="#6B7280" />
                  <Text style={styles.damageInfoText}>
                     Use as sugestões abaixo ou descreva manualmente. Seja específico sobre valores e quantidades.
                  </Text>
               </View>
            </View>

            {/* Templates de Prejuízos */}
            <View style={styles.inputGroup}>
               <Text style={styles.label}>Tipos de Prejuízos</Text>

               <View style={styles.categoriesContainer}>
                  {damageTemplates.map((template) => (
                     <View key={template.id} style={styles.categoryContainer}>
                        <TouchableOpacity
                           style={[
                              styles.categoryHeader,
                              activeCategory === template.id && styles.categoryHeaderActive
                           ]}
                           onPress={() => setActiveCategory(
                              activeCategory === template.id ? null : template.id
                           )}
                        >
                           {template.icon}
                           <Text style={styles.categoryTitle}>{template.category}</Text>
                           <ChevronDown
                              size={16}
                              color={template.color}
                              style={{
                                 transform: [{
                                    rotate: activeCategory === template.id ? '180deg' : '0deg'
                                 }]
                              }}
                           />
                        </TouchableOpacity>

                        {activeCategory === template.id && (
                           <View style={styles.templateItems}>
                              {template.items.map((item, index) => {
                                 const isSelected = selectedTemplates.includes(item);
                                 return (
                                    <TouchableOpacity
                                       key={index}
                                       style={[
                                          styles.templateItem,
                                          isSelected && styles.templateItemSelected
                                       ]}
                                       onPress={() => toggleTemplate(item)}
                                    >
                                       <View style={styles.templateItemContent}>
                                          {isSelected ? (
                                             <Minus size={14} color={template.color} />
                                          ) : (
                                             <Plus size={14} color={template.color} />
                                          )}
                                          <Text
                                             style={[
                                                styles.templateItemText,
                                                isSelected && { color: template.color }
                                             ]}
                                          >
                                             {item}
                                          </Text>
                                       </View>
                                    </TouchableOpacity>
                                 );
                              })}
                           </View>
                        )}
                     </View>
                  ))}
               </View>

            </View>

            {/* Observações */}
            <View style={styles.inputGroup}>
               <Text style={styles.label}>Observações Adicionais (opcional)</Text>
               <View style={styles.inputRow}>
                  <TextInput
                     style={[styles.input, styles.textArea]}
                     placeholder="Contexto adicional, causas, medidas tomadas..."
                     placeholderTextColor={COLORS.placeholder}
                     value={description}
                     onChangeText={setDescription}
                     multiline
                     numberOfLines={3}
                     textAlignVertical="top"
                  />
               </View>
            </View>
         </ScrollView>

         {/* Botões */}
         <View style={styles.buttonContainer}>
            <TouchableOpacity
               style={[styles.button, styles.cancelButton]}
               onPress={onCancel}
            >
               <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
               style={[styles.button, styles.submitButton]}
               onPress={handleSubmit}
            >
               <Text style={styles.submitButtonText}>
                  {initialEvent ? 'Atualizar' : 'Salvar'}
               </Text>
            </TouchableOpacity>
         </View>

         {/* Modal de Seleção de Localização */}
         {showLocationPicker && (
            <View style={styles.modalOverlay}>
               <View style={styles.locationModal}>
                  <View style={styles.modalHeader}>
                     <Text style={styles.modalTitle}>Selecionar Localização</Text>
                     <TouchableOpacity
                        onPress={() => setShowLocationPicker(false)}
                        style={styles.modalCloseButton}
                     >
                        <X size={24} color={COLORS.text} />
                     </TouchableOpacity>
                  </View>

                  <View style={styles.searchContainer}>
                     <Search color={COLORS.placeholder} size={20} />
                     <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar localização..."
                        placeholderTextColor={COLORS.placeholder}
                        value={locationSearch}
                        onChangeText={setLocationSearch}
                        autoFocus
                     />
                  </View>

                  <FlatList
                     data={filteredLocations}
                     keyExtractor={(item, index) => `${item}-${index}`}
                     renderItem={({ item }) => {
                        const eventData = locationEvents[item];
                        return (
                           <TouchableOpacity
                              style={[
                                 styles.locationItem,
                                 location === item && styles.selectedLocationItem
                              ]}
                              onPress={() => handleLocationSelect(item)}
                           >
                              <MapPin
                                 size={16}
                                 color={location === item ? COLORS.primary : COLORS.placeholder}
                              />
                              <View style={styles.locationInfo}>
                                 <Text style={[
                                    styles.locationItemText,
                                    location === item && styles.selectedLocationItemText
                                 ]}>
                                    {item}
                                 </Text>
                                 {eventData && (
                                    <View style={styles.locationMeta}>
                                       <Text style={styles.locationDate}>
                                          {format(new Date(eventData.date), 'dd/MM/yyyy')}
                                       </Text>
                                       <View style={[
                                          styles.severityDot,
                                          { backgroundColor: getSeverityColor(eventData.severity || 'medium') }
                                       ]} />
                                       <Text style={[
                                          styles.locationSeverity,
                                          { color: getSeverityColor(eventData.severity || 'medium') }
                                       ]}>
                                          {getSeverityLabel(eventData.severity || 'medium')}
                                       </Text>
                                    </View>
                                 )}
                              </View>
                              {location === item && (
                                 <CheckCircle size={16} color={COLORS.primary} />
                              )}
                           </TouchableOpacity>
                        );
                     }}
                     ListEmptyComponent={() => (
                        <View style={styles.emptyLocationsList}>
                           <Text style={styles.emptyLocationsText}>
                              Nenhuma localização encontrada
                           </Text>
                        </View>
                     )}
                     style={styles.locationsList}
                     showsVerticalScrollIndicator={false}
                  />
               </View>
            </View>
         )}
      </KeyboardAvoidingView>
   );
};

const styles = StyleSheet.create({
   container: {
      flex: 1,
      backgroundColor: '#F8FAFC',
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
      width: 28,
      height: 28,
      marginRight: 12,
   },
   headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: COLORS.text,
   },
   headerSubtitle: {
      fontSize: 14,
      color: COLORS.placeholder,
   },
   closeButton: {
      padding: 4,
   },
   content: {
      flex: 1,
      padding: 20,
   },
   inputGroup: {
      marginBottom: 24,
   },
   label: {
      fontSize: 16,
      fontWeight: '500',
      color: COLORS.text,
      marginBottom: 8,
   },
   inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: '#E5E7EB',
   },
   input: {
      flex: 1,
      marginLeft: 12,
      fontSize: 16,
      color: COLORS.text,
   },
   textArea: {
      minHeight: 100,
      textAlignVertical: 'top',
   },
   inputText: {
      flex: 1,
      marginLeft: 12,
      fontSize: 16,
      color: COLORS.text,
   },
   damageInfo: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginTop: 8,
      paddingLeft: 16,
   },
   damageInfoText: {
      fontSize: 14,
      color: '#6B7280',
      marginLeft: 6,
      flex: 1,
      lineHeight: 18,
   },
   severityContainer: {
      flexDirection: 'row',
      gap: 8,
   },
   severityButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      borderWidth: 1.5,
   },
   severityText: {
      fontSize: 14,
      fontWeight: '500',
      marginLeft: 6,
   },
   // Sugestões Inteligentes
   suggestionsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
   },
   suggestionsTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: COLORS.text,
      marginLeft: 8,
   },
   smartSuggestion: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      padding: 16,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: '#E5E7EB',
      borderLeftWidth: 4,
      borderLeftColor: COLORS.primary,
   },
   suggestionContent: {
      flex: 1,
   },
   suggestionText: {
      fontSize: 14,
      color: COLORS.text,
      fontWeight: '500',
      marginBottom: 4,
   },
   suggestionMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
   },
   suggestionReason: {
      fontSize: 12,
      color: COLORS.placeholder,
      fontStyle: 'italic',
   },
   // Templates
   templatesHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
   },
   toggleSuggestions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
   },
   toggleText: {
      fontSize: 14,
      color: COLORS.primary,
      fontWeight: '500',
   },
   categoriesContainer: {
      gap: 12,
   },
   categoryContainer: {
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#E5E7EB',
      overflow: 'hidden',
   },
   categoryHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      backgroundColor: '#F8FAFC',
   },
   categoryHeaderActive: {
      backgroundColor: '#F3F4F6',
   },
   categoryTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: COLORS.text,
      marginLeft: 8,
      flex: 1,
   },
   templateItems: {
      padding: 16,
      gap: 8,
   },
   templateItem: {
      backgroundColor: '#F8FAFC',
      borderRadius: 8,
      padding: 12,
      borderWidth: 1,
      borderColor: '#E5E7EB',
   },
   templateItemSelected: {
      backgroundColor: `${COLORS.primary}10`,
      borderColor: COLORS.primary,
   },
   templateItemContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
   },
   templateItemText: {
      fontSize: 14,
      color: COLORS.text,
      flex: 1,
   },
   // Estados para localização
   noLocationsContainer: {
      alignItems: 'center',
      padding: 32,
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#E5E7EB',
   },
   noLocationsTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: COLORS.text,
      marginTop: 16,
      marginBottom: 8,
   },
   noLocationsText: {
      fontSize: 14,
      color: COLORS.placeholder,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 20,
   },
   goToLocationsButton: {
      backgroundColor: COLORS.primary,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
   },
   goToLocationsText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '500',
   },
   selectedLocationText: {
      fontSize: 14,
      color: '#10B981',
      marginLeft: 6,
   },
   autoFillInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
      marginLeft: 12,
      borderLeftColor: '#E5E7EB',
   },
   autoFillText: {
      fontSize: 12,
      color: COLORS.primary,
      marginLeft: 4,
      fontStyle: 'italic',
   },
   buttonContainer: {
      flexDirection: 'row',
      padding: 20,
      gap: 12,
      backgroundColor: '#FFFFFF',
      borderTopWidth: 1,
      borderTopColor: '#E5E7EB',
   },
   button: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 8,
      alignItems: 'center',
   },
   cancelButton: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: COLORS.placeholder,
   },
   cancelButtonText: {
      fontSize: 16,
      fontWeight: '500',
      color: COLORS.placeholder,
   },
   submitButton: {
      backgroundColor: COLORS.primary,
   },
   submitButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
   },
   // Modal de localização
   modalOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
   },
   locationModal: {
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      width: '90%',
      maxHeight: '70%',
      overflow: 'hidden',
   },
   modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: '#E5E7EB',
   },
   modalTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: COLORS.text,
   },
   modalCloseButton: {
      padding: 4,
   },
   searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      margin: 16,
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: '#F3F4F6',
      borderRadius: 8,
   },
   searchInput: {
      flex: 1,
      marginLeft: 12,
      fontSize: 16,
      color: COLORS.text,
   },
   locationsList: {
      maxHeight: 300,
   },
   locationItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#F3F4F6',
   },
   selectedLocationItem: {
      backgroundColor: `${COLORS.primary}10`,
   },
   locationInfo: {
      flex: 1,
      marginLeft: 12,
   },
   locationItemText: {
      fontSize: 16,
      color: COLORS.text,
      marginBottom: 2,
   },
   selectedLocationItemText: {
      color: COLORS.primary,
      fontWeight: '500',
   },
   locationMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
   },
   locationDate: {
      fontSize: 12,
      color: COLORS.placeholder,
   },
   severityDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
   },
   locationSeverity: {
      fontSize: 12,
      fontWeight: '500',
   },
   emptyLocationsList: {
      padding: 32,
      alignItems: 'center',
   },
   emptyLocationsText: {
      fontSize: 14,
      color: COLORS.placeholder,
   },
});