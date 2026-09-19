import { useState } from 'react';
import { Pressable, StyleSheet, TextInput } from 'react-native';

import { SERVICE_CATEGORIES, type ServiceInput } from '@/domain/service';
import { AppFonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

type Props = {
  initialValue?: ServiceInput;
  submitLabel: string;
  onSubmit: (input: ServiceInput) => void;
  submitting: boolean;
};

export function ServiceForm({ initialValue, submitLabel, onSubmit, submitting }: Props) {
  const theme = useTheme();
  const [nome, setNome] = useState(initialValue?.nome ?? '');
  const [descricao, setDescricao] = useState(initialValue?.descricao ?? '');
  const [precoBase, setPrecoBase] = useState(initialValue ? String(initialValue.preco_base) : '');
  const [codCategoria, setCodCategoria] = useState(initialValue?.cod_categoria ?? null);
  const [formError, setFormError] = useState<string | null>(null);
  const inputStyle = [styles.input, { color: theme.text, borderColor: theme.textSecondary }];

  function handleSubmit() {
    const preco = Number(precoBase.replace(',', '.'));
    if (!nome.trim()) {
      setFormError('Nome é obrigatório');
      return;
    }
    if (!precoBase.trim() || Number.isNaN(preco) || preco < 0) {
      setFormError('Preço base inválido');
      return;
    }
    const categoria = SERVICE_CATEGORIES.find((c) => c.cod_categoria === codCategoria);
    if (!categoria) {
      setFormError('Selecione uma categoria');
      return;
    }
    setFormError(null);
    onSubmit({
      nome: nome.trim(),
      descricao: descricao.trim() || null,
      preco_base: preco,
      categoria: categoria.categoria,
      cod_categoria: categoria.cod_categoria,
    });
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="smallBold">Nome *</ThemedText>
      <TextInput
        style={inputStyle}
        value={nome}
        onChangeText={setNome}
        placeholder="Ex: Troca de óleo"
        placeholderTextColor={theme.textSecondary}
      />

      <ThemedText type="smallBold">Descrição</ThemedText>
      <TextInput
        style={inputStyle}
        value={descricao}
        onChangeText={setDescricao}
        placeholder="Detalhes do serviço"
        placeholderTextColor={theme.textSecondary}
      />

      <ThemedText type="smallBold">Categoria *</ThemedText>
      <ThemedView style={styles.categoryRow}>
        {SERVICE_CATEGORIES.map((item) => (
          <Pressable key={item.cod_categoria} onPress={() => setCodCategoria(item.cod_categoria)}>
            <ThemedView
              type={codCategoria === item.cod_categoria ? 'backgroundSelected' : 'backgroundElement'}
              style={styles.categoryChip}>
              <ThemedText type={codCategoria === item.cod_categoria ? 'smallBold' : 'small'}>
                {item.categoria}
              </ThemedText>
            </ThemedView>
          </Pressable>
        ))}
      </ThemedView>

      <ThemedText type="smallBold">Preço base (R$) *</ThemedText>
      <TextInput
        style={inputStyle}
        value={precoBase}
        onChangeText={setPrecoBase}
        placeholder="80.00"
        placeholderTextColor={theme.textSecondary}
        keyboardType="decimal-pad"
      />

      {formError && <ThemedText style={styles.errorText}>{formError}</ThemedText>}

      <Pressable
        style={[styles.submitButton, { backgroundColor: theme.primary }]}
        onPress={handleSubmit}
        disabled={submitting}>
        <ThemedText type="smallBold" style={styles.submitLabel}>
          {submitting ? 'Salvando...' : submitLabel}
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 8,
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
  },
  input: {
    fontFamily: AppFonts.body,
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  categoryChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  submitButton: {
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  submitLabel: {
    color: '#FFFFFF',
  },
  errorText: {
    color: '#C0392B',
  },
});
