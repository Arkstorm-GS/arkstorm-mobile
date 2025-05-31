import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { 
  Grid,
  Home, 
  Building, 
  Zap, 
  DollarSign
} from 'lucide-react-native';
import { COLORS } from '@/constants/theme';

type DamageCategory = 'all' | 'residential' | 'commercial' | 'infrastructure' | 'personal';

interface Props {
  selectedCategory: DamageCategory;
  onCategoryChange: (category: DamageCategory) => void;
}

export const CategorySelector: React.FC<Props> = ({ 
  selectedCategory, 
  onCategoryChange 
}) => {
  const categories = [
    {
      key: 'all' as DamageCategory,
      label: 'Todos',
      icon: <Grid size={16} />,
      color: COLORS.text,
      description: 'Todos os tipos'
    },
    {
      key: 'residential' as DamageCategory,
      label: 'Residencial',
      color: '#8B5CF6',
      description: 'Casas e apartamentos'
    },
    {
      key: 'commercial' as DamageCategory,
      label: 'Comercial',
      icon: <Building size={16} />,
      color: '#F59E0B',
      description: 'Lojas e empresas'
    },
    {
      key: 'infrastructure' as DamageCategory,
      label: 'Infraestrutura',
      icon: <Zap size={16} />,
      color: '#EF4444',
      description: 'Rede elétrica'
    },
    {
      key: 'personal' as DamageCategory,
      label: 'Pessoal',
      icon: <DollarSign size={16} />,
      color: '#10B981',
      description: 'Bens e alimentos'
    }
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Categoria de prejuízo:</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.key}
            style={[
              styles.categoryButton,
              {
                backgroundColor: selectedCategory === category.key 
                  ? category.color 
                  : 'transparent',
                borderColor: category.color
              }
            ]}
            onPress={() => onCategoryChange(category.key)}
          >
            
            <View style={styles.textContainer}>
              <Text style={[
                styles.categoryText,
                { color: selectedCategory === category.key ? '#FFFFFF' : category.color }
              ]}>
                {category.label}
              </Text>
              <Text style={[
                styles.descriptionText,
                { color: selectedCategory === category.key ? '#FFFFFF' : COLORS.placeholder }
              ]}>
                {category.description}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
  scrollContainer: {
    paddingHorizontal: 4,
    gap: 12,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    minWidth: 140,
  },
  iconContainer: {
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  descriptionText: {
    fontSize: 11,
    fontWeight: '400',
  },
});