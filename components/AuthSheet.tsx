import { useState } from 'react';
import { YStack, XStack, Button, Input, SizableText, Paragraph, Spinner } from '@blinkdotnew/mobile-ui';
import { Platform } from 'react-native';
import { useAuth } from '@/hooks/useAuth';

interface AuthSheetProps {
  onSuccess: () => void;
}

export function AuthSheet({ onSuccess }: AuthSheetProps) {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password);
      }
      await signIn(email, password);
      onSuccess();
    } catch (e: any) {
      setError(e?.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <YStack gap="$4" padding="$4">
      <YStack gap="$1" alignItems="center" marginBottom="$2">
        <SizableText size="$6" fontWeight="800" color="$color12">
          {isSignUp ? 'Creer un compte' : 'Connectez-vous'}
        </SizableText>
        <Paragraph size="$3" color="$color10" textAlign="center">
          {isSignUp
            ? 'Creez un compte pour analyser vos materiaux'
            : 'Connectez-vous pour scanner vos materiaux'}
        </Paragraph>
      </YStack>

      <Input
        size="$4"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        {...(Platform.OS === 'web' ? { style: { outlineStyle: 'none' } } : {})}
      />
      <Input
        size="$4"
        placeholder="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        {...(Platform.OS === 'web' ? { style: { outlineStyle: 'none' } } : {})}
      />

      {error ? (
        <Paragraph size="$3" color="$red10" textAlign="center">
          {error}
        </Paragraph>
      ) : null}

      <Button
        theme="active"
        size="$4"
        onPress={handleSubmit}
        disabled={loading || !email || !password}
        icon={loading ? <Spinner size="small" /> : undefined}
      >
        {loading ? '' : isSignUp ? "S'inscrire" : 'Se connecter'}
      </Button>

      <XStack justifyContent="center" gap="$1">
        <Paragraph size="$3" color="$color10">
          {isSignUp ? 'Deja un compte ?' : 'Pas de compte ?'}
        </Paragraph>
        <SizableText
          size="$3"
          fontWeight="600"
          color="$color9"
          onPress={() => setIsSignUp(!isSignUp)}
        >
          {isSignUp ? 'Se connecter' : "S'inscrire"}
        </SizableText>
      </XStack>
    </YStack>
  );
}
