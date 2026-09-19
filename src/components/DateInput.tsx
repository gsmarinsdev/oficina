import { useEffect, useState } from 'react';
import { TextInput, type TextInputProps } from 'react-native';

import { displayToIso, isoToDisplay, maskDateInput } from '@/utils/dateMask';

type Props = Omit<TextInputProps, 'value' | 'onChangeText' | 'onChange'> & {
  value: string | null; // sempre ISO (aaaa-mm-dd), formato que o Supabase espera
  onChange: (iso: string | null) => void;
};

// Campo de data com máscara dd/mm/aaaa — por fora mostra/edita nesse
// formato, por dentro conversa com o resto do app em ISO.
export function DateInput({ value, onChange, ...rest }: Props) {
  const [display, setDisplay] = useState(() => isoToDisplay(value));

  // Se o valor vier de fora (ex: carregou um orçamento existente), sincroniza.
  useEffect(() => {
    setDisplay(isoToDisplay(value));
  }, [value]);

  function handleChangeText(text: string) {
    const masked = maskDateInput(text);
    setDisplay(masked);
    onChange(displayToIso(masked));
  }

  return (
    <TextInput
      placeholder="dd/mm/aaaa"
      keyboardType="numeric"
      maxLength={10}
      {...rest}
      value={display}
      onChangeText={handleChangeText}
    />
  );
}
