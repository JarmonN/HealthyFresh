import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import foodData from '../foodData.json';

interface FoodItem {
  ID?: number | string;
  Name?: string;
  Name_subtitle?: string;
  Keywords?: string;
  Pantry_Min?: number | string;
  Pantry_Max?: number | string;
  Pantry_Metric?: string;
  Pantry_tips?: string;
  Refrigerate_Min?: number | string;
  Refrigerate_Max?: number | string;
  Refrigerate_Metric?: string;
  Refrigerate_tips?: string;
  DOP_Refrigerate_Min?: number | string;
  DOP_Refrigerate_Max?: number | string;
  DOP_Refrigerate_Metric?: string;
  Refrigerate_After_Opening_Min?: number | string;
  Refrigerate_After_Opening_Max?: number | string;
  Refrigerate_After_Opening_Metric?: string;
  Freeze_Min?: number | string;
  Freeze_Max?: number | string;
  Freeze_Metric?: string;
  Freeze_Tips?: string;
  DOP_Freeze_Min?: number | string;
  DOP_Freeze_Max?: number | string;
  DOP_Freeze_Metric?: string;
}

function formatDuration(
  min?: number | string,
  max?: number | string,
  metric?: string
): string {
  if (!metric) return '';
  if (metric === 'Not Recommended' || metric === 'Package use-by date') {
    return metric;
  }
  if (min !== undefined && min !== '' && max !== undefined && max !== '') {
    return String(min) === String(max) ? `${min} ${metric}` : `${min} - ${max} ${metric}`;
  }
  return metric;
}

const FoodCard = ({ item }: { item: FoodItem }) => {
  const pantryTime = formatDuration(item.Pantry_Min, item.Pantry_Max, item.Pantry_Metric);
  const hasPantry = Boolean(pantryTime || item.Pantry_tips);

  const fridgeStandard = formatDuration(item.Refrigerate_Min, item.Refrigerate_Max, item.Refrigerate_Metric);
  const fridgeDOP = formatDuration(item.DOP_Refrigerate_Min, item.DOP_Refrigerate_Max, item.DOP_Refrigerate_Metric);
  const fridgeOpened = formatDuration(
    item.Refrigerate_After_Opening_Min,
    item.Refrigerate_After_Opening_Max,
    item.Refrigerate_After_Opening_Metric
  );
  const hasFridge = Boolean(fridgeStandard || fridgeDOP || fridgeOpened || item.Refrigerate_tips);

  const freezeStandard = formatDuration(item.Freeze_Min, item.Freeze_Max, item.Freeze_Metric);
  const freezeDOP = formatDuration(item.DOP_Freeze_Min, item.DOP_Freeze_Max, item.DOP_Freeze_Metric);
  const hasFreeze = Boolean(freezeStandard || freezeDOP || item.Freeze_Tips);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{item.Name}</Text>
      {item.Name_subtitle ? <Text style={styles.subtitle}>{item.Name_subtitle}</Text> : null}

      {hasPantry ? (
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Pantry</Text>
          {pantryTime ? <Text style={styles.value}>{pantryTime}</Text> : null}
          {item.Pantry_tips ? <Text style={styles.tip}>{item.Pantry_tips}</Text> : null}
        </View>
      ) : null}

      {hasFridge ? (
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Refrigerator</Text>
          {fridgeStandard ? <Text style={styles.value}>General: {fridgeStandard}</Text> : null}
          {fridgeDOP ? <Text style={styles.value}>From Purchase: {fridgeDOP}</Text> : null}
          {fridgeOpened ? <Text style={styles.value}>After Opening: {fridgeOpened}</Text> : null}
          {item.Refrigerate_tips ? <Text style={styles.tip}>{item.Refrigerate_tips}</Text> : null}
        </View>
      ) : null}

      {hasFreeze ? (
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Freezer</Text>
          {freezeStandard ? <Text style={styles.value}>General: {freezeStandard}</Text> : null}
          {freezeDOP ? <Text style={styles.value}>From Purchase: {freezeDOP}</Text> : null}
          {item.Freeze_Tips ? <Text style={styles.tip}>{item.Freeze_Tips}</Text> : null}
        </View>
      ) : null}
    </View>
  );
};

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Simulate a quick 1-second startup load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Filter valid items and match against Name, Subtitle, or Keywords
  const filteredItems = (foodData as FoodItem[]).filter((row) => {
    if (!row.Name) return false;
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    const nameMatch = row.Name.toLowerCase().includes(query);
    const subtitleMatch = row.Name_subtitle?.toLowerCase().includes(query) ?? false;
    const keywordMatch = row.Keywords?.toLowerCase().includes(query) ?? false;

    return nameMatch || subtitleMatch || keywordMatch;
  });

  // Loading Screen View
  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2f855a" />
        <Text style={styles.loadingTitle}>HealthyFresh</Text>
        <Text style={styles.loadingSubtitle}>Loading storage guide...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>HealthyFresh Storage Guide</Text>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search food (e.g., cheddar, milk, eggs)..."
          placeholderTextColor="#a0aec0"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Cards List */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item, index) => (item.ID ? String(item.ID) : String(index))}
        renderItem={({ item }) => <FoodCard item={item} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No items match "{searchQuery}"</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f4f6f8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2f855a',
    marginTop: 16,
  },
  loadingSubtitle: {
    fontSize: 15,
    color: '#718096',
    marginTop: 4,
  },
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a202c',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cbd5e0',
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#1a202c',
  },
  clearButton: {
    padding: 6,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#718096',
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderTopWidth: 4,
    borderTopColor: '#2f855a',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a202c',
  },
  subtitle: {
    fontSize: 14,
    color: '#718096',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  section: {
    backgroundColor: '#edf2f7',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  sectionHeader: {
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 2,
  },
  value: {
    fontSize: 14,
    color: '#1a202c',
  },
  tip: {
    fontSize: 13,
    color: '#4a5568',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: '#718096',
    fontSize: 16,
    marginTop: 32,
  },
});
