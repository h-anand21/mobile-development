import React, { forwardRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Globe, Search, Check } from 'lucide-react-native';

import { useThemeColors } from '@/theme/colors';
import { LANGUAGES } from '@/constants/languages';
import { Language } from '@/types/snippet.types';
import { useSettingsStore } from '@/store/settingsStore';

interface LanguagePickerModalProps {
  selectedLanguage: Language;
  onSelect: (lang: Language) => void;
}

export const LanguagePickerModal = forwardRef<BottomSheetModal, LanguagePickerModalProps>(
  ({ selectedLanguage, onSelect }, ref) => {
    const colors = useThemeColors();
    const styles = getStyles(colors);
    const { enabledLanguages } = useSettingsStore();
    const [search, setSearch] = useState('');

    const filteredLangs = LANGUAGES.filter(l => 
      enabledLanguages.includes(l.label) && l.label.toLowerCase().includes(search.toLowerCase())
    );

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={['50%', '85%']}
        handleIndicatorStyle={{ backgroundColor: colors.text.tertiary }}
        backgroundStyle={{ backgroundColor: colors.bg.secondary }}
        backdropComponent={(props) => (
          <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.6} />
        )}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Globe size={24} color={colors.accent.primary} />
            <Text style={styles.title}>Select Language</Text>
          </View>

          {/* Search */}
          <View style={styles.searchWrap}>
            <Search size={20} color={colors.text.tertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search language..."
              placeholderTextColor={colors.text.tertiary}
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
                  {isSelected && <Check size={20} color={colors.accent.primary} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </BottomSheetModal>
    );
  }
);

const getStyles = (colors: any) => ({
  container: { flex: 1, padding: 20, backgroundColor: colors.bg.secondary },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  title: { fontSize: 20, fontWeight: '800', color: colors.text.primary },
  
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bg.tertiary,
    borderWidth: 1, borderColor: colors.border.primary, borderRadius: 12,
    height: 50, paddingHorizontal: 16, marginBottom: 16,
  },
  searchInput: { flex: 1, color: colors.text.primary, fontSize: 16, marginLeft: 12 },

  list: { paddingBottom: 40 },
  langRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border.primary,
  },
  langRowSelected: { backgroundColor: colors.accent.primary + '10', paddingHorizontal: 12, borderRadius: 12, borderBottomWidth: 0, marginVertical: 4 },
  langLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  langDot: { width: 12, height: 12, borderRadius: 6 },
  langText: { fontSize: 16, color: colors.text.primary, fontWeight: '500' },
  langTextSelected: { color: colors.accent.primary, fontWeight: '700' },
} as any);
