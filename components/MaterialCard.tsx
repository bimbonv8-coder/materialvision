import { Card, YStack, XStack, Paragraph, SizableText, Progress } from '@blinkdotnew/mobile-ui';
import { View } from 'react-native';

interface Material {
  name: string;
  category: string;
  finish: string;
  color: string;
  confidence: number;
  description: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  Bois: '#C4A47A',
  Metal: '#A0AAB5',
  Pierre: '#B8B0A0',
  Verre: '#A8D8EA',
  Textile: '#D4A0A0',
  Mineral: '#A0A8A0',
};

export function MaterialCard({ material }: { material: Material }) {
  const catColor = CATEGORY_COLORS[material.category] || material.color;
  const confidencePercent = Math.round(material.confidence * 100);

  return (
    <Card
      bordered
      width="100%"
      pressStyle={{ scale: 0.98 }}
      animation="bouncy"
    >
      <Card.Header padded>
        <XStack gap="$3" alignItems="center">
          <View
            style={{
              width: 14,
              height: 14,
              borderRadius: 7,
              backgroundColor: material.color,
              borderWidth: 1.5,
              borderColor: 'rgba(255,255,255,0.2)',
            }}
          />
          <YStack flex={1}>
            <SizableText size="$5" fontWeight="700" color="$color12">
              {material.name}
            </SizableText>
            <XStack gap="$2" marginTop="$1">
              <View
                style={{
                  backgroundColor: catColor + '30',
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 100,
                }}
              >
                <SizableText size="$2" color={catColor} fontWeight="600">
                  {material.category}
                </SizableText>
              </View>
              <View
                style={{
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 100,
                }}
              >
                <SizableText size="$2" color="$color10">
                  {material.finish}
                </SizableText>
              </View>
            </XStack>
          </YStack>
          <YStack alignItems="center">
            <SizableText size="$5" fontWeight="800" color="$color12">
              {confidencePercent}%
            </SizableText>
            <SizableText size="$1" color="$color10">
              confiance
            </SizableText>
          </YStack>
        </XStack>
      </Card.Header>
      <Card.Footer padded>
        <YStack gap="$1" width="100%">
          <Progress value={confidencePercent} size="$1" width="100%">
            <Progress.Indicator
              animation="bouncy"
              backgroundColor={catColor}
            />
          </Progress>
          <Paragraph size="$3" color="$color10" marginTop="$1">
            {material.description}
          </Paragraph>
        </YStack>
      </Card.Footer>
    </Card>
  );
}
