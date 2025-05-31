import React, { useEffect, useRef, useState } from 'react';
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
   Animated,
   Keyboard,
   StyleSheet
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Location from 'expo-location';
import MapView, { Marker, Region } from 'react-native-maps';
import {
   Calendar,
   MapPin,
   X,
   Save,
   AlertTriangle,
   Info,
   Navigation,
   CheckCircle,
   Clock
} from 'lucide-react-native';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import uuid from 'react-native-uuid';
import { Event } from '@/interfaces/Event';
import { COLORS } from '@/constants/theme';

interface Props {
   initialEvent?: Event;
   onSubmit: (event: Event) => void;
   onCancel: () => void;
   isLoading?: boolean;
}

export const EventForm: React.FC<Props> = ({
   initialEvent,
   onSubmit,
   onCancel,
   isLoading = false
}) => {
   // Estados principais
   const [date, setDate] = useState<string>(
      initialEvent?.date || new Date().toISOString()
   );
   const [location, setLocation] = useState(initialEvent?.location || '');
   const [severity, setSeverity] = useState<'low' | 'medium' | 'high'>(
      initialEvent?.severity || 'medium'
   );
   const [showDatePicker, setShowDatePicker] = useState(false);

   // Estados de localização
   const [marker, setMarker] = useState<{
      latitude: number;
      longitude: number;
   } | null>(initialEvent?.latitude && initialEvent?.longitude
      ? { latitude: initialEvent.latitude, longitude: initialEvent.longitude }
      : null
   );

   const [region, setRegion] = useState<Region>({
      latitude: marker?.latitude || -23.5505,
      longitude: marker?.longitude || -46.6333,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05
   });

   const [addressDetails, setAddressDetails] = useState<{
      street?: string;
      district?: string;
      city?: string;
      region?: string;
      postalCode?: string;
   }>({});

   // Estados de UX
   const [isLoadingLocation, setIsLoadingLocation] = useState(false);
   const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);
   const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

   // Animações
   const fadeAnim = useRef(new Animated.Value(0)).current;
   const slideAnim = useRef(new Animated.Value(50)).current;

   useEffect(() => {
      // Animação de entrada
      Animated.parallel([
         Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
         }),
         Animated.timing(slideAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
         })
      ]).start();

      requestLocationPermission();
   }, []);

   const requestLocationPermission = async () => {
      try {
         const { status } = await Location.requestForegroundPermissionsAsync();
         if (status === 'granted' && !marker) {
            setIsLoadingLocation(true);
            const loc = await Location.getCurrentPositionAsync({
               accuracy: Location.Accuracy.High
            });
            const { latitude, longitude } = loc.coords;
            setRegion(r => ({ ...r, latitude, longitude }));
            await updateLocationFromCoords(latitude, longitude);
         } else {
            setLocationPermissionDenied(true);
         }
      } catch (error) {
         console.warn('Erro ao obter localização:', error);
         setLocationPermissionDenied(true);
      } finally {
         setIsLoadingLocation(false);
      }
   };

   const validateForm = (): boolean => {
      const errors: { [key: string]: string } = {};

      if (!location.trim()) {
         errors.location = 'Localização é obrigatória';
      }

      if (!marker) {
         errors.marker = 'Selecione um ponto no mapa';
      }

      setFormErrors(errors);
      return Object.keys(errors).length === 0;
   };

   const onChangeDate = (_: any, selected?: Date) => {
      setShowDatePicker(Platform.OS === 'ios');
      if (selected) {
         setDate(selected.toISOString());
      }
   };

   const handleMapPress = async (e: any) => {
      const { latitude, longitude } = e.nativeEvent.coordinate;
      await updateLocationFromCoords(latitude, longitude);
   };

   const updateLocationFromText = async (text: string) => {
      if (!text.trim()) return;

      setIsLoadingLocation(true);
      try {
         const geocoded = await Location.geocodeAsync(text);
         if (geocoded.length) {
            const { latitude, longitude } = geocoded[0];
            await updateLocationFromCoords(latitude, longitude);
            setFormErrors(prev => ({ ...prev, location: '', marker: '' }));
         } else {
            Alert.alert('Localização não encontrada', 'Tente um endereço mais específico');
         }
      } catch (err) {
         console.warn('Erro no geocoding:', err);
         Alert.alert('Erro', 'Não foi possível buscar a localização');
      } finally {
         setIsLoadingLocation(false);
      }
   };

   const updateLocationFromCoords = async (latitude: number, longitude: number) => {
      setMarker({ latitude, longitude });
      setRegion(r => ({ ...r, latitude, longitude }));

      try {
         const [addr] = await Location.reverseGeocodeAsync({ latitude, longitude });
         setAddressDetails({
            street: addr.street ?? undefined,
            district: addr.district ?? undefined,
            city: addr.city ?? undefined,
            region: addr.region ?? undefined,
            postalCode: addr.postalCode ?? undefined
         });

         const parts = [
            addr.street,
            addr.district,
            addr.city,
            addr.region,
            addr.postalCode
         ].filter(Boolean);
         setLocation(parts.join(', '));
      } catch (err) {
         console.warn('Erro no reverse geocode:', err);
      }
   };

   const handleSubmit = () => {
      if (!validateForm()) {
         Alert.alert('Formulário incompleto', 'Por favor, corrija os erros antes de continuar');
         return;
      }

      onSubmit({
         id: initialEvent?.id ?? String(uuid.v4()),
         date,
         location,
         latitude: marker?.latitude,
         longitude: marker?.longitude,
         severity
      });
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

         <Animated.View
            style={[
               styles.animatedContainer,
               {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
               }
            ]}
         >
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
                        {initialEvent ? 'Editar Evento' : 'Novo Evento'}
                     </Text>
                     <Text style={styles.headerSubtitle}>
                        Registre informações sobre o evento climático
                     </Text>
                  </View>
               </View>
               <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
                  <X size={24} color={COLORS.text} />
               </TouchableOpacity>
            </View>

            <ScrollView
               style={styles.content}
               showsVerticalScrollIndicator={false}
               keyboardShouldPersistTaps="handled"
            >
               {/* Data */}
               <View style={styles.inputGroup}>
                  <Text style={styles.label}>Data do Evento</Text>
                  <TouchableOpacity
                     style={styles.inputRow}
                     onPress={() => setShowDatePicker(true)}
                  >
                     <Calendar color={COLORS.primary} size={20} />
                     <Text style={styles.inputText}>
                        {format(new Date(date), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                     </Text>
                  </TouchableOpacity>
               </View>

               {showDatePicker && (
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
                  <View style={[
                     styles.inputRow,
                     formErrors.location && styles.inputError
                  ]}>
                     <MapPin color={COLORS.primary} size={20} />
                     <TextInput
                        style={styles.input}
                        placeholder="Digite o endereço, bairro ou CEP"
                        placeholderTextColor={COLORS.placeholder}
                        value={location}
                        onChangeText={setLocation}
                        onSubmitEditing={() => {
                           Keyboard.dismiss();
                           updateLocationFromText(location);
                        }}
                        editable={!isLoadingLocation}
                        autoCapitalize="words"
                     />
                     {isLoadingLocation && (
                        <Clock size={16} color={COLORS.placeholder} />
                     )}
                  </View>
                  {formErrors.location && (
                     <Text style={styles.errorText}>{formErrors.location}</Text>
                  )}

                  {/* Mapa */}
                  <View style={styles.mapContainer}>
                     <MapView
                        style={[
                           styles.map,
                           formErrors.marker && styles.mapError
                        ]}
                        region={region}
                        onPress={handleMapPress}
                        showsUserLocation
                        showsMyLocationButton
                     >
                        {marker && (
                           <Marker
                              coordinate={marker}
                              pinColor={COLORS.primary}
                           />
                        )}
                     </MapView>
                  </View>

                  {formErrors.marker && (
                     <Text style={styles.errorText}>{formErrors.marker}</Text>
                  )}

                  {/* Detalhes do Endereço */}
                  {(addressDetails.city || addressDetails.district) && (
                     <View style={styles.addressDetails}>
                        <Text style={styles.addressTitle}>Detalhes do Endereço:</Text>
                        {addressDetails.street && (
                           <Text style={styles.addressText}>📍 {addressDetails.street}</Text>
                        )}
                        {addressDetails.district && (
                           <Text style={styles.addressText}>🏘️ {addressDetails.district}</Text>
                        )}
                        {addressDetails.city && (
                           <Text style={styles.addressText}>🏙️ {addressDetails.city}</Text>
                        )}
                        {addressDetails.region && (
                           <Text style={styles.addressText}>📍 {addressDetails.region}</Text>
                        )}
                        {addressDetails.postalCode && (
                           <Text style={styles.addressText}>📮 {addressDetails.postalCode}</Text>
                        )}
                     </View>
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

               {/* Informações de Permissão */}
               {locationPermissionDenied && (
                  <View style={styles.permissionWarning}>
                     <AlertTriangle size={20} color="#F59E0B" />
                     <Text style={styles.permissionText}>
                        Permissão de localização negada. Você pode inserir o endereço manualmente ou selecionar no mapa.
                     </Text>
                  </View>
               )}
            </ScrollView>

            {/* Botões */}
            <View style={styles.buttonContainer}>
               <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={onCancel}
                  disabled={isLoading}
               >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
               </TouchableOpacity>
               <TouchableOpacity
                  style={[styles.button, styles.submitButton]}
                  onPress={handleSubmit}
                  disabled={isLoading}
               >
                  <Text style={styles.submitButtonText}>
                     {isLoading ? 'Salvando...' : 'Salvar'}
                  </Text>
               </TouchableOpacity>
            </View>
         </Animated.View>
      </KeyboardAvoidingView>
   );
};

const styles = StyleSheet.create({
   container: {
      flex: 1,
      backgroundColor: '#F8FAFC',
   },
   animatedContainer: {
      flex: 1,
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
      elevation: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
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
   inputText: {
      flex: 1,
      marginLeft: 12,
      fontSize: 16,
      color: COLORS.text,
   },
   textAreaContainer: {
      alignItems: 'flex-start',
      minHeight: 100,
   },
   textArea: {
      minHeight: 80,
      textAlignVertical: 'top',
   },
   descriptionFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 8,
   },
   characterCount: {
      fontSize: 12,
      color: COLORS.placeholder,
   },
   validationSuccess: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
   },
   validationText: {
      fontSize: 12,
      color: '#10B981',
      fontWeight: '500',
   },
   mapContainer: {
      marginTop: 12,
      borderRadius: 12,
      overflow: 'hidden',
      position: 'relative',
   },
   map: {
      height: 200,
   },
   mapError: {
      borderWidth: 2,
      borderColor: '#EF4444',
   },
   currentLocationButton: {
      position: 'absolute',
      top: 12,
      right: 12,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: COLORS.primary,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      gap: 6,
   },
   currentLocationText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '500',
   },
   addressDetails: {
      backgroundColor: '#F8FAFC',
      borderRadius: 12,
      padding: 16,
      marginTop: 12,
      borderWidth: 1,
      borderColor: '#E5E7EB',
   },
   addressTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: COLORS.text,
      marginBottom: 8,
   },
   addressText: {
      fontSize: 14,
      color: COLORS.placeholder,
      marginBottom: 4,
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
   permissionWarning: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: '#FEF3C7',
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: '#FDE68A',
   },
   permissionText: {
      flex: 1,
      fontSize: 14,
      color: '#92400E',
      marginLeft: 12,
      lineHeight: 18,
   },
   errorText: {
      fontSize: 12,
      color: '#EF4444',
      marginTop: 4,
      marginLeft: 4,
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
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      borderRadius: 8,
      gap: 8,
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
      elevation: 2,
      shadowColor: COLORS.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
   },
   submitButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
   },
});