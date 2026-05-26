// ============================================================
// DevNest — Language Picker Modal
// ============================================================
import React, { forwardRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Globe, Search, Check } from 'lucide-react-native';

import { Colors } from '@/theme/colors';
import { LANGUAGES } from '@/constants/languages';
import { Language } from '@/types/snippet.types';

interface LanguagePickerModalProps {
  selectedLanguage: Language;
  onSelect: (lang: Language) => void;
}

export const LanguagePickerModal = forwardRef<BottomSheetModal, LanguagePickerModalProps>(
  ({ selectedLanguage, onSelect }, ref) => {
    const [search, setSearch] = useState('');

    const filteredLangs = LANGUAGES.filter(l => 
      l.label.toLowerCase().includes(search.toLowerCase())
    );

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={['50%', '85%']}
        handleIndicatorStyle={{ backgroundColor: Colors.text.tertiary }}
        backgroundStyle={{ backgroundColor: Colors.bg.secondary }}
        backdropComponent={(props) => (
          <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.6} />
        )}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Globe size={24} color={Colors.accent.primary} />
            <Text style={styles.title}>Select Language</Text>
          </View>

          {/* Search */}
          <View style={styles.searchWrap}>
            <Search size={20} color={Colors.text.tertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search language..."
              placeholderTextColor={Colors.text.tertiary}
              value={search}
              onChangeText={setSearch}
            />
          </View>

          {/* List */}
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
            {filteredLangs.map(lang => {
              const isSelected = selectedLanguage === lang.label;
              return (
                <TouchableOpacity
                  key={lang.label}
                  style={[styles.langRow, isSelected && styles.langRowSelected]}
                  onPress={() => onSelect(lang.label as Language)}
                >
                  <View style={styles.langLeft}>
                    <View style={[styles.langDot, { backgroundColor: lang.color }]} />
                    <Text style={[styles.langText, isSelected && styles.langTextSelected]}>
                      {lang.label}
                    </Text>
                  </View>
                  {isSelected && <Check size={20} color={Colors.accent.primary} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </BottomSheetModal>
    );
  }
);

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  title: { fontSize: 20, fontWeight: '800', color: Colors.text.primary },
  
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bg.tertiary,
    borderWidth: 1, borderColor: Colors.border.primary, borderRadius: 12,
    height: 50, paddingHorizontal: 16, marginBottom: 16,
  },
  searchInput: { flex: 1, color: Colors.text.primary, fontSize: 16, marginLeft: 12 },

  list: { paddingBottom: 40 },
  langRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: Colors.border.primary,
  },
  langRowSelected: { backgroundColor: Colors.accent.primary + '10', paddingHorizontal: 12, borderRadius: 12, borderBottomWidth: 0, marginVertical: 4 },
  langLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  langDot: { width: 12, height: 12, borderRadius: 6 },
  langText: { fontSize: 16, color: Colors.text.primary, fontWeight: '500' },
  langTextSelected: { color: Colors.accent.primary, fontWeight: '700' },
});
