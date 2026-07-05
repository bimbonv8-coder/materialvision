import { useState, useCallback } from 'react';
import { Platform, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import {
  YStack,
  XStack,
  Button,
  SizableText,
  Paragraph,
  ScrollView,
  Spinner,
  BlinkDialog,
  SafeArea,
} from '@blinkdotnew/mobile-ui';
import { Camera, Upload, LogOut, Scan, Sparkles } from '@blinkdotnew/mobile-ui';
import { blink } from '@/lib/blink';
import { useAuth } from '@/hooks/useAuth';
import { MaterialCard } from '@/components/MaterialCard';
import { AuthSheet } from '@/components/AuthSheet';
import { ScanHistory } from '@/components/ScanHistory';
import type { Material } from '@/types';

const ANALYSIS_SYSTEM_PROMPT = `You are an expert material scientist and interior design specialist. Analyze the provided image and identify ALL visible materials, surfaces, and finishes.

For each material detected, provide:
- name: the specific material name (e.g., "Chene massif", "Acier inoxydable brosse", "Marbre de Carrare")
- category: one of ["Bois", "Metal", "Pierre", "Verre", "Textile", "Mineral", "Plastique", "Ceramique", "Cuir", "Composite"]
- finish: the finish type (e.g., "Mat", "Brillant", "Satine", "Brosse", "Poli", "Brut", "Naturel", "Texture", "Patine")
- color: hex color code matching the material's dominant color
- confidence: number between 0 and 1 indicating detection confidence
- description: one sentence in French describing the material's characteristics and where it's visible in the image

Return materials as an array sorted by confidence (highest first). Detect 3-7 materials maximum.`;

export default function Home() {
  const { user, isAuthenticated, isLoading, signOut } = useAuth();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [materials, setMaterials] = useState<Material[] | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [error, setError] = useState('');

  const pickImage = useCallback(async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission requise', 'Autorisez l\'acces a la galerie pour scanner des materiaux.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsEditing: true,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        setMaterials(null);
        setError('');
      }
    } catch (e) {
      setError('Erreur lors de la selection de l\'image');
    }
  }, []);

  const takePhoto = useCallback(async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission requise', 'Autorisez l\'acces a la camera pour scanner des materiaux.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
        allowsEditing: true,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        setMaterials(null);
        setError('');
      }
    } catch (e) {
      setError('Erreur lors de la prise de photo');
    }
  }, []);

  const handleScanPress = useCallback(() => {
    if (!isAuthenticated) {
      setShowAuth(true);
      return;
    }
    pickImage();
  }, [isAuthenticated, pickImage]);

  const analyzeImage = useCallback(async () => {
    if (!selectedImage) return;

    setAnalyzing(true);
    setError('');

    try {
      const response = await fetch(selectedImage);
      const blob = await response.blob();
      const file = new File([blob], `scan-${Date.now()}.jpg`, { type: 'image/jpeg' });

      const { publicUrl } = await blink.storage.upload(file, `scans/${Date.now()}.jpg`);

      const { text } = await blink.ai.generateText({
        model: 'gemini-2.5-flash-image-preview',
        system: ANALYSIS_SYSTEM_PROMPT,
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: 'Analyze this image and return ONLY a valid JSON object with a "materials" array. Each material must have: name, category, finish, color, confidence (0-1), description (in French). No markdown, no code blocks, just raw JSON.' },
            { type: 'image', image: publicUrl },
          ],
        }],
      });

      const jsonMatch = text?.match(/\{[\s\S]*\}/);
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { materials: [] };
      const detected = parsed.materials || [];
      setMaterials(detected);

      try {
        await blink.db.table('scans').create({
          image_url: publicUrl,
          materials: JSON.stringify(detected),
        } as any);
      } catch {}
    } catch (e: any) {
      setError(e?.message || "Erreur lors de l'analyse. Reessayez.");
    } finally {
      setAnalyzing(false);
    }
  }, [selectedImage]);

  if (isLoading) {
    return (
      <SafeArea flex={1} backgroundColor="$color2">
        <YStack flex={1} justifyContent="center" alignItems="center" gap="$4">
          <Spinner size="large" color="$color9" />
          <Paragraph color="$color10">Chargement...</Paragraph>
        </YStack>
      </SafeArea>
    );
  }

  return (
    <SafeArea flex={1} backgroundColor="$color2">
      <ScrollView flex={1} showsVerticalScrollIndicator={false}>
        <YStack padding="$4" gap="$5" paddingBottom="$8">
          {/* Header */}
          <XStack justifyContent="space-between" alignItems="center">
            <XStack gap="$2" alignItems="center">
              <Sparkles size={24} color="$color9" />
              <SizableText size="$7" fontWeight="800" color="$color12">
                MaterialVision
              </SizableText>
            </XStack>
            {isAuthenticated && (
              <XStack gap="$2" alignItems="center">
                <SizableText size="$2" color="$color10">
                  {user?.email}
                </SizableText>
                <Button
                  size="$2"
                  chromeless
                  icon={<LogOut size={16} color="$color10" />}
                  onPress={signOut}
                />
              </XStack>
            )}
          </XStack>

          {/* Hero / Scan Area */}
          {!selectedImage ? (
            <YStack
              backgroundColor="$color3"
              borderRadius="$6"
              padding="$6"
              alignItems="center"
              gap="$4"
              borderWidth={1}
              borderColor="$color4"
              borderStyle="dashed"
            >
              <Scan size={48} color="$color9" />
              <YStack alignItems="center" gap="$1">
                <SizableText size="$5" fontWeight="700" color="$color12" textAlign="center">
                  Scannez vos materiaux
                </SizableText>
                <Paragraph size="$3" color="$color10" textAlign="center">
                  Prenez une photo ou selectionnez une image pour detecter automatiquement les materiaux et finitions
                </Paragraph>
              </YStack>
              <XStack gap="$3">
                <Button
                  theme="active"
                  size="$4"
                  icon={<Camera size={18} />}
                  onPress={() => {
                    if (!isAuthenticated) {
                      setShowAuth(true);
                      return;
                    }
                    takePhoto();
                  }}
                >
                  Photo
                </Button>
                <Button
                  variant="outline"
                  size="$4"
                  icon={<Upload size={18} />}
                  onPress={handleScanPress}
                >
                  Galerie
                </Button>
              </XStack>
              {!isAuthenticated && (
                <Paragraph size="$2" color="$color9" textAlign="center">
                  Connectez-vous pour analyser vos images
                </Paragraph>
              )}
            </YStack>
          ) : (
            /* Selected Image + Analyze */
            <YStack gap="$4">
              <Image
                source={{ uri: selectedImage }}
                style={{
                  width: '100%',
                  aspectRatio: 4 / 3,
                  borderRadius: 16,
                }}
                contentFit="cover"
              />
              <XStack gap="$3">
                <Button
                  variant="outline"
                  size="$3"
                  flex={1}
                  onPress={() => {
                    setSelectedImage(null);
                    setMaterials(null);
                    setError('');
                  }}
                >
                  Changer d'image
                </Button>
                <Button
                  theme="active"
                  size="$3"
                  flex={1}
                  onPress={analyzeImage}
                  disabled={analyzing}
                  icon={analyzing ? <Spinner size="small" /> : <Sparkles size={18} />}
                >
                  {analyzing ? 'Analyse...' : 'Analyser'}
                </Button>
              </XStack>
            </YStack>
          )}

          {/* Error */}
          {error ? (
            <YStack backgroundColor="$red3" padding="$4" borderRadius="$4">
              <Paragraph size="$3" color="$red10">
                {error}
              </Paragraph>
            </YStack>
          ) : null}

          {/* Analyzing State */}
          {analyzing && (
            <YStack alignItems="center" gap="$3" padding="$4">
              <Spinner size="large" color="$color9" />
              <Paragraph size="$3" color="$color10" textAlign="center">
                Analyse des materiaux en cours...
              </Paragraph>
            </YStack>
          )}

          {/* Results */}
          {materials && materials.length > 0 && (
            <YStack gap="$3">
              <XStack gap="$2" alignItems="center">
                <Sparkles size={18} color="$color9" />
                <SizableText size="$5" fontWeight="700" color="$color12">
                  {materials.length} materiaux detectes
                </SizableText>
              </XStack>
              <YStack gap="$3">
                {materials.map((material, index) => (
                  <MaterialCard key={index} material={material} />
                ))}
              </YStack>
            </YStack>
          )}

          {/* Scan History */}
          <ScanHistory />
        </YStack>
      </ScrollView>

      {/* Auth Dialog */}
      <BlinkDialog
        open={showAuth}
        onOpenChange={setShowAuth}
      >
        <AuthSheet onSuccess={() => setShowAuth(false)} />
      </BlinkDialog>
    </SafeArea>
  );
}
