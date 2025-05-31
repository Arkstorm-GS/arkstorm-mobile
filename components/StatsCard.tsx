import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/theme';

interface Props {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  isText?: boolean;
}

export const StatsCard: React.FC<Props> = ({ 
  icon, 
  label, 
  value, 
  color, 
  isText = false 
}) => {
  return (
    <View style={[styles.container, { borderColor: `${color}30` }]}>
      <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
        {icon}
      </View>
      <View style={styles.content}>
        <Text style={styles.label}>{label}</Text>
        <Text 
          style={[
            styles.value, 
            { color },
            isText && styles.textValue
          ]}
          numberOfLines={isText ? 1 : undefined}
        >
          {value}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: COLORS.placeholder,
    marginBottom: 2,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
  },
  textValue: {
    fontSize: 14,
  },
});