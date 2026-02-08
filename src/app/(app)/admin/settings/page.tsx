/**
 * Admin Settings Page - Feature Flags
 * Phase 4 - Feature Management
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Settings } from 'lucide-react';
import { FEATURE_FLAGS } from '@/lib/featureFlags';

export default function AdminSettingsPage() {
  const featuresList = [
    {
      key: 'GAMIFICATION',
      name: 'Gamification',
      description: 'Badges, challenges, streaks, XP system',
      category: 'Phase 3',
    },
    {
      key: 'NOTIFICATIONS',
      name: 'Smart Notifications',
      description: 'Push, email, and in-app notifications',
      category: 'Phase 3',
    },
    {
      key: 'SIMULATIONS',
      name: 'What-If Simulations',
      description: 'Scenario comparison and simulation engine',
      category: 'Phase 3',
    },
    {
      key: 'TEMPORAL_EVOLUTION',
      name: 'Temporal Evolution',
      description: 'History tracking, trends, and temporal charts',
      category: 'Phase 3',
    },
    {
      key: 'ANIMATIONS',
      name: 'Animated Fiscal Day',
      description: 'Interactive animated timeline of daily taxes',
      category: 'Phase 3',
    },
    {
      key: 'QUIZ_FEATURES',
      name: 'Quiz Features',
      description: 'Personalized fiscal quiz and challenges',
      category: 'Phase 3',
    },
    {
      key: 'SOCIAL',
      name: 'Social Features (Legacy)',
      description: 'Basic social sharing features',
      category: 'Phase 3',
    },
    {
      key: 'SOCIAL_FEATURES',
      name: 'Social Features',
      description: 'Friends, groups, leaderboard, wrapped',
      category: 'Phase 4',
    },
    {
      key: 'AI_INTEGRATION',
      name: 'AI Integration',
      description: 'AI-powered OCR, chat, and analysis',
      category: 'Phase 4',
    },
    {
      key: 'REFERENTIEL_AUTOMATION',
      name: 'Referentiel Automation',
      description: 'Automated fiscal data updates (backend)',
      category: 'Phase 4',
    },
    {
      key: 'ADMIN_INTERFACE',
      name: 'Admin Interface',
      description: 'Admin dashboard and management tools (backend)',
      category: 'Phase 4',
    },
  ];

  const categories = ['Phase 3', 'Phase 4'];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Settings className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Feature Flags</h1>
        </div>
        <p className="text-gray-500">
          Manage feature rollout and availability across the application
        </p>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Note:</strong> Feature flags are configured via environment variables. Changes
          require restarting the application to take effect. This page displays the current
          configuration in read-only mode.
        </AlertDescription>
      </Alert>

      {categories.map((category) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle>{category}</CardTitle>
            <CardDescription>Features from {category} development phase</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {featuresList
                .filter((f) => f.category === category)
                .map((feature) => {
                  const isEnabled =
                    FEATURE_FLAGS[feature.key as keyof typeof FEATURE_FLAGS] ?? false;

                  return (
                    <div key={feature.key} className="flex items-center justify-between py-3 border-b last:border-0">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{feature.name}</h4>
                          <Badge variant={isEnabled ? 'default' : 'secondary'}>
                            {isEnabled ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Env var: {feature.key.startsWith('ADMIN') || feature.key.startsWith('REFERENTIEL') ? '' : 'NEXT_PUBLIC_'}
                          ENABLE_{feature.key}
                        </p>
                      </div>
                      <Switch checked={isEnabled} disabled />
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader>
          <CardTitle>Configuration Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <h4 className="font-medium mb-2">To enable/disable a feature:</h4>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Update the corresponding environment variable in <code>.env</code> or <code>.env.local</code></li>
              <li>Set the value to <code>"true"</code> to enable or <code>"false"</code> to disable</li>
              <li>Restart the Next.js development server or rebuild for production</li>
              <li>Refresh this page to see the updated configuration</li>
            </ol>
          </div>
          <div className="bg-gray-50 p-3 rounded border">
            <p className="font-mono text-xs">
              # Example:<br />
              NEXT_PUBLIC_ENABLE_AI_INTEGRATION="false"<br />
              ENABLE_REFERENTIEL_AUTOMATION="true"
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
