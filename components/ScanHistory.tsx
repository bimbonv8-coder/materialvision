import { useQuery } from '@tanstack/react-query';
import { blink } from '@/lib/blink';
import { YStack, Card, XStack, SizableText, Paragraph, Spinner } from '@blinkdotnew/mobile-ui';
import { Image } from 'expo-image';
import type { Material } from '@/types';

interface ScanRow {
  id: string;
  image_url: string;
  materials: string;
  created_at: string;
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'Recent';
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "A l'instant";
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays < 7) return `Il y a ${diffDays}j`;
  return date.toLocaleDateString('fr-FR');
}

export function ScanHistory() {
  const { data: scans, isLoading } = useQuery({
    queryKey: ['scans'],
    queryFn: async () => {
      const result = await blink.db.table<ScanRow>('scans').list({
        orderBy: { created_at: 'desc' },
        limit: 10,
      });
      return result;
    },
  });

  if (isLoading) {
    return (
      <YStack alignItems="center" padding="$4">
        <Spinner size="small" color="$color9" />
      </YStack>
    );
  }

  if (!scans || scans.length === 0) {
    return (
      <YStack alignItems="center" padding="$4">
        <Paragraph color="$color10" size="$3">
          Aucun scan pour le moment
        </Paragraph>
      </YStack>
    );
  }

  return (
    <YStack gap="$3">
      <SizableText size="$5" fontWeight="700" color="$color12">
        Scans recents
      </SizableText>
      {scans.map((scan) => {
        let materials: Material[] = [];
        try {
          materials = typeof scan.materials === 'string'
            ? JSON.parse(scan.materials)
            : scan.materials;
        } catch {}

        return (
          <Card key={scan.id} bordered pressStyle={{ scale: 0.98 }} animation="bouncy">
            <XStack gap="$3" padding="$3" alignItems="center">
              <Image
                source={{ uri: scan.image_url }}
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 12,
                }}
                contentFit="cover"
              />
              <YStack flex={1} gap="$1">
                <SizableText size="$4" fontWeight="600" color="$color12" numberOfLines={1}>
                  {materials.map((m) => m.name).join(', ')}
                </SizableText>
                <XStack gap="$2" flexWrap="wrap">
                  {materials.slice(0, 3).map((m, i) => (
                    <SizableText key={i} size="$2" color="$color9">
                      {m.category}
                    </SizableText>
                  ))}
                </XStack>
              </YStack>
              <SizableText size="$2" color="$color10">
                {timeAgo(scan.created_at)}
              </SizableText>
            </XStack>
          </Card>
        );
      })}
    </YStack>
  );
}
