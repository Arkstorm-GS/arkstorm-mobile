import { COLORS } from '@/constants/theme';
import { Event } from '@/interfaces/Event';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
   AlertTriangle,
   Calendar,
   CheckCircle,
   ChevronDown,
   Info,
   MapPin,
   Search,
   Timer,
   X,
   Zap
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
   Alert,
   FlatList,
   Image,
   KeyboardAvoidingView,
   Platform,
   ScrollView,
   StatusBar,
   StyleSheet,
   Text,
   TextInput,
   TouchableOpacity,
   View
} from 'react-native';
import uuid from 'react-native-uuid';

interface Props {
   initialEvent?: Event;
   onSubmit: (event: Event) => void;
   onCancel: () => void;
}

export const DurationForm: React.FC<Props> = ({
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
   const [duration, setDuration] = useState(
      initialEvent?.duration || ''
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

   // Validação em tempo real da duração
   const [durationError, setDurationError] = useState('');
   const [estimatedImpact, setEstimatedImpact] = useState('');

   // Carrega localizações disponíveis do AsyncStorage
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

   // Valida e formata a duração conforme o usuário digita
   useEffect(() => {
      if (!duration) {
         setDurationError('');
         setEstimatedImpact('');
         return;
      }

      // Aceita formatos: "2h30", "2h 30m", "150m", "2.5h", "90 min"
      const patterns = [
         /^(\d+)h\s*(\d+)m?$/i,           // 2h30, 2h 30m
         /^(\d+)h$/i,                     // 2h
         /^(\d+)m(?:in)?$/i,              // 30m, 30min
         /^(\d+)\s*min(?:utos?)?$/i,      // 90 minutos
         /^(\d+(?:\.\d+)?)h$/i,           // 2.5h
         /^(\d+)$/                        // 120 (assume minutos)
      ];

      let isValid = false;
      let totalMinutes = 0;

      // Verifica padrão 1: 2h30, 2h 30m
      const match1 = duration.match(/^(\d+)h\s*(\d+)m?$/i);
      if (match1) {
         const hours = parseInt(match1[1]);
         const minutes = parseInt(match1[2]);
         if (minutes < 60) {
            totalMinutes = hours * 60 + minutes;
            isValid = true;
         }
      }

      // Verifica padrão 2: 2h
      else if (/^(\d+)h$/i.test(duration)) {
         const hours = parseInt(duration.match(/^(\d+)h$/i)![1]);
         totalMinutes = hours * 60;
         isValid = true;
      }

      // Verifica padrão 3: 30m, 30min
      else if (/^(\d+)m(?:in)?$/i.test(duration)) {
         totalMinutes = parseInt(duration.match(/^(\d+)m(?:in)?$/i)![1]);
         isValid = true;
      }

      // Verifica padrão 4: 90 minutos
      else if (/^(\d+)\s*min(?:utos?)?$/i.test(duration)) {
         totalMinutes = parseInt(duration.match(/^(\d+)\s*min(?:utos?)?$/i)![1]);
         isValid = true;
      }

      // Verifica padrão 5: 2.5h
      else if (/^(\d+(?:\.\d+)?)h$/i.test(duration)) {
         const hours = parseFloat(duration.match(/^(\d+(?:\.\d+)?)h$/i)![1]);
         totalMinutes = Math.round(hours * 60);
         isValid = true;
      }

      // Verifica padrão 6: apenas números (assume minutos)
      else if (/^(\d+)$/.test(duration)) {
         totalMinutes = parseInt(duration);
         isValid = true;
      }

      if (!isValid) {
         setDurationError('Formato inválido. Use: 2h30, 2h, 30m, 90min, 2.5h ou 120');
         setEstimatedImpact('');
      } else if (totalMinutes <= 0) {
         setDurationError('A duração deve ser maior que zero');
         setEstimatedImpact('');
      } else if (totalMinutes > 24 * 60) {
         setDurationError('Duração máxima: 24 horas');
         setEstimatedImpact('');
      } else {
         setDurationError('');

         // Calcula impacto estimado
         if (totalMinutes < 30) {
            setEstimatedImpact('Interrupção breve - impacto mínimo');
         } else if (totalMinutes < 60) {
            setEstimatedImpact('Interrupção curta - alguns inconvenientes');
         } else if (totalMinutes < 240) {
            setEstimatedImpact('Interrupção média - impacto moderado');
         } else if (totalMinutes < 480) {
            setEstimatedImpact('Interrupção longa - impacto significativo');
         } else {
            setEstimatedImpact('Interrupção muito longa - impacto severo');
         }
      }
   }, [duration]);

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

      // Verifica se a localização selecionada existe na lista
      if (!availableLocations.includes(location)) {
         Alert.alert(
            'Localização inválida',
            'Por favor, selecione uma localização da lista de locais já cadastrados.'
         );
         return;
      }

      if (!duration.trim()) {
         Alert.alert('Campo obrigatório', 'Por favor, informe a duração da interrupção.');
         return;
      }

      if (durationError) {
         Alert.alert('Duração inválida', durationError);
         return;
      }

      // Normaliza a duração para formato padrão
      const normalizedDuration = normalizeDuration(duration);

      const event: Event = {
         id: initialEvent?.id ?? String(uuid.v4()),
         date,
         location: location.trim(),
         duration: normalizedDuration,
         severity,
         latitude: initialEvent?.latitude,
         longitude: initialEvent?.longitude,
      };

      onSubmit(event);
   };

   // Normaliza duração para formato "Xh Ym"
   const normalizeDuration = (input: string): string => {
      let totalMinutes = 0;

      const match1 = input.match(/^(\d+)h\s*(\d+)m?$/i);
      if (match1) {
         totalMinutes = parseInt(match1[1]) * 60 + parseInt(match1[2]);
      } else if (/^(\d+)h$/i.test(input)) {
         totalMinutes = parseInt(input.match(/^(\d+)h$/i)![1]) * 60;
      } else if (/^(\d+)m(?:in)?$/i.test(input)) {
         totalMinutes = parseInt(input.match(/^(\d+)m(?:in)?$/i)![1]);
      } else if (/^(\d+)\s*min(?:utos?)?$/i.test(input)) {
         totalMinutes = parseInt(input.match(/^(\d+)\s*min(?:utos?)?$/i)![1]);
      } else if (/^(\d+(?:\.\d+)?)h$/i.test(input)) {
         totalMinutes = Math.round(parseFloat(input.match(/^(\d+(?:\.\d+)?)h$/i)![1]) * 60);
      } else if (/^(\d+)$/.test(input)) {
         totalMinutes = parseInt(input);
      }

      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      if (hours === 0) return `${minutes}m`;
      if (minutes === 0) return `${hours}h`;
      return `${hours}h ${minutes}m`;
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
                     {initialEvent ? 'Editar Duração' : 'Nova Duração'}
                  </Text>
                  <Text style={styles.headerSubtitle}>
                     Registre o tempo de interrupção
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

            {/* Duração */}
            <View style={styles.inputGroup}>
               <Text style={styles.label}>Duração da Interrupção *</Text>
               <View style={[
                  styles.inputRow,
                  durationError ? styles.inputError : null
               ]}>
                  <Timer color={durationError ? '#EF4444' : COLORS.primary} size={20} />
                  <TextInput
                     style={styles.input}
                     placeholder="Ex: 2h30, 90min, 1.5h"
                     placeholderTextColor={COLORS.placeholder}
                     value={duration}
                     onChangeText={setDuration}
                  />
               </View>
               {durationError ? (
                  <Text style={styles.errorText}>{durationError}</Text>
               ) : estimatedImpact ? (
                  <View style={styles.impactInfo}>
                     <Info size={14} color="#6B7280" />
                     <Text style={styles.impactText}>{estimatedImpact}</Text>
                  </View>
               ) : null}

               <View style={styles.durationExamples}>
                  <Text style={styles.examplesTitle}>Exemplos de formato:</Text>
                  <View style={styles.examplesList}>
                     <Text style={styles.example}>• 2h30 ou 2h 30m</Text>
                     <Text style={styles.example}>• 90min ou 90 minutos</Text>
                     <Text style={styles.example}>• 1.5h ou 3h</Text>
                  </View>
               </View>
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
   inputError: {
      borderColor: '#EF4444',
   },
   input: {
      flex: 1,
      marginLeft: 12,
      fontSize: 16,
      color: COLORS.text,
   },
   textArea: {
      minHeight: 60,
   },
   inputText: {
      flex: 1,
      marginLeft: 12,
      fontSize: 16,
      color: COLORS.text,
   },
   errorText: {
      fontSize: 14,
      color: '#EF4444',
      marginTop: 4,
      marginLeft: 16,
   },
   impactInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
      marginLeft: 16,
   },
   impactText: {
      fontSize: 14,
      color: '#6B7280',
      marginLeft: 6,
   },
   durationExamples: {
      marginTop: 8,
      padding: 12,
      backgroundColor: '#F3F4F6',
      borderRadius: 8,
   },
   examplesTitle: {
      fontSize: 14,
      fontWeight: '500',
      color: COLORS.text,
      marginBottom: 4,
   },
   examplesList: {
      gap: 2,
   },
   example: {
      fontSize: 13,
      color: COLORS.placeholder,
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
   // Estilos para seleção de localização
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
   selectedLocationInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
      paddingLeft: 16,
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
      maxHeight: '80%',
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
   locationItemText: {
      flex: 1,
      marginLeft: 12,
      fontSize: 16,
      color: COLORS.text,
   },
   selectedLocationItemText: {
      color: COLORS.primary,
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
   addLocationButton: {
      padding: 16,
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: '#E5E7EB',
   },
   addLocationText: {
      fontSize: 14,
      color: COLORS.primary,
      fontWeight: '500',
   },
});