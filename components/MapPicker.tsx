import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput } from 'react-native';
import MapView, { Marker, MapPressEvent } from 'react-native-maps';
import * as Location from 'expo-location';
import { COLORS } from '../constants/theme';

type Props = {
  onSelect: (address: string) => void;
  selected?: string;
};

export default function MapPicker({ onSelect, selected }: Props) {
  const [region, setRegion] = useState({ latitude: 0, longitude: 0, latitudeDelta: 0.012, longitudeDelta: 0.012 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setRegion(r => ({ ...r, latitude: loc.coords.latitude, longitude: loc.coords.longitude }));
      }
      setLoading(false);
    })();
  }, []);

  const handlePress = async (e: MapPressEvent) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    updateLocation(latitude, longitude);
  };

  const handleSearch = async () => {
    if (!searchQuery) return;
    setLoading(true);
    try {
      const res = await Location.geocodeAsync(searchQuery);
      if (res.length) {
        const { latitude, longitude } = res[0];
        updateLocation(latitude, longitude);
      }
    } catch (e) {
      console.warn('Erro geocodificando:', e);
    }
    setLoading(false);
  };

  const updateLocation = async (latitude: number, longitude: number) => {
    setRegion(r => ({ ...r, latitude, longitude }));
    const [rev] = await Location.reverseGeocodeAsync({ latitude, longitude });
    const address = rev.postalCode
      ? `${rev.postalCode} - ${rev.district || rev.city}`
      : rev.city
      ? `${rev.city}, ${rev.region}`
      : rev.name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    onSelect(address);
  };

  if (loading) return <ActivityIndicator style={{ margin: 20 }} />;

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Bairro, Cidade ou CEP"
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmitEditing={handleSearch}
        returnKeyType="search"
      />
      <MapView style={styles.map} region={region} onPress={handlePress}>
        <Marker coordinate={{ latitude: region.latitude, longitude: region.longitude }} />
      </MapView>
      <Text style={styles.selectedText}>{selected || 'Selecione um local acima'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderRadius: 10, overflow: 'hidden', backgroundColor: COLORS.surface, marginBottom: 16 },
  searchInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    margin: 16,
    backgroundColor: COLORS.surface,
  },
  map: { width: '100%', height: 200 },
  selectedText: { padding: 12, textAlign: 'center', color: COLORS.text },
});

/* import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import MapView, { Marker, MapPressEvent } from 'react-native-maps';
import * as Location from 'expo-location';
import { COLORS } from '../constants/theme';
import { styles } from '../styles/locations.styles';

type Props = {
  onLocationSelect: (coords: { latitude: number; longitude: number }) => void;
};

export default function MapPicker({ onLocationSelect }: Props) {
  const [region, setRegion] = useState<{
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      let loc = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05
      });
      setLoading(false);
    })();
  }, []);

  if (loading || !region) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <MapView
      style={styles.map}
      initialRegion={region}
      onPress={(e: MapPressEvent) => onLocationSelect(e.nativeEvent.coordinate)}
    >
      <Marker coordinate={region} pinColor={COLORS.primary} />
    </MapView>
  );
} */