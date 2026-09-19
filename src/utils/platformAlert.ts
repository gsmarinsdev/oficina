import { Alert, Platform } from 'react-native';

// O Alert.alert do React Native não desenha nada visível quando roda na
// versão web (react-native-web só loga no console). Essas duas funções
// escolhem a implementação certa por plataforma, pra sempre dar retorno
// visual ao usuário, seja no navegador ou no celular.

export function showError(title: string, message: string) {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
    return;
  }
  Alert.alert(title, message);
}

export function confirmAction(title: string, message: string, onConfirm: () => void) {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Confirmar', style: 'destructive', onPress: onConfirm },
  ]);
}
