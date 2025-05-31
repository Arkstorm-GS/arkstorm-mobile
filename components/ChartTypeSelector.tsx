import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { 
  TrendingUp, 
  BarChart3, 
  Calendar
} from 'lucide-react-native';
import { COLORS } from '@/constants/theme';

type ChartType = 'line' | 'column' | 'weekly';

interface Props {
  selectedType: ChartType;
  onTypeChange: (type: ChartType) => void;
}

export const ChartTypeSelector: React.FC<Props> = ({ 
  selectedType, 
  onTypeChange 
}) => {
  const chartTypes = [
    {
      key: 'line' as ChartType,
      label: 'Linha',
      icon: <TrendingUp size={16} />,
      description: 'Tendência temporal'
    },
    {
      key: 'weekly' as ChartType,
      label: 'Semanal',
      icon: <Calendar size={16} />,
      description: 'Média por semana'
    }
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Tipo de visualização:</Text>
      <View style={styles.buttonContainer}>
        {chartTypes.map((type) => (
          <TouchableOpacity
            key={type.key}
            style={[
              styles.button,
              {
                backgroundColor: selectedType === type.key 
                  ? COLORS.primary 
                  : 'transparent',
                borderColor: COLORS.primary
              }
            ]}
            onPress={() => onTypeChange(type.key)}
          >
            <View style={styles.iconContainer}>
              {React.cloneElement(type.icon, {
                color: selectedType === type.key ? '#FFFFFF' : COLORS.primary
              })}
            </View>
            <View style={styles.textContainer}>
              <Text style={[
                styles.buttonText,
                { color: selectedType === type.key ? '#FFFFFF' : COLORS.primary }
              ]}>
                {type.label}
              </Text>
              <Text style={[
                styles.descriptionText,
                { color: selectedType === type.key ? '#FFFFFF' : COLORS.placeholder }
              ]}>
                {type.description}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  iconContainer: {
    marginRight: 8,
  },
  textContainer: {
    flex: 1,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  descriptionText: {
    fontSize: 12,
  },
});