import { Button } from '@/components/ui/button';
import {
  MaterialSymbol,
  TabbyPageHeader,
  TabbySection,
} from '@/components/tabby/TabbyPrimitives';
import { useAuth } from '@/hooks/useAuth';
import { useClasses, useSubjects, useTasks, useUserPreferences } from '@/hooks/useFirestoreSync';
import { signOut } from '@/lib/auth';
import { CircularProgress } from '@/lib/material-web-react';

type SyncTimestamp = Date | number | string | { toDate: () => Date };

function formatLastSync(timestamp?: SyncTimestamp | null) {
  if (!timestamp) return 'Never';

  const date = typeof timestamp === 'object' && 'toDate' in timestamp
    ? timestamp.toDate()
    : new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/20 px-4 py-3 last:border-b-0">
      <span className="text-body-small font-bold text-muted-foreground">{label}</span>
      <span className="text-right text-body-medium font-black text-foreground">{value}</span>
    </div>
  );
}

export function SettingsPage() {
  const { user } = useAuth();
  const { preferences, loading: prefsLoading } = useUserPreferences();
  const { tasks } = useTasks();
  const { classes } = useClasses();
  const { subjects } = useSubjects();
  const connected = Boolean(preferences?.lastSyncedAt);

  return (
    <div className="h-full min-h-full overflow-auto px-5 pb-2 pt-9 sm:px-8 sm:pt-9 lg:px-[108px]">
      <div className="w-full pb-4">
        <TabbyPageHeader
          title="Settings"
          subtitle="Account, sync status, and preferences mirrored from Android Tabby."
          symbol="settings"
          shape="circle"
          titleVariation='"wght" 1000, "wdth" 25, "ROND" 100'
        />

        <div className="space-y-7">
          <TabbySection title="Account">
            <div className="px-4 py-4">
              {user && (
                <div className="flex items-center gap-4">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="size-16 rounded-[1.25rem] object-cover ring-4 ring-tabby-mint"
                    />
                  ) : (
                    <div className="grid size-16 place-items-center rounded-[1.25rem] bg-tabby-mint text-primary">
                      <MaterialSymbol name="person" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-title-medium font-black text-foreground">{user.displayName}</p>
                    <p className="truncate text-body-small text-muted-foreground">{user.email}</p>
                  </div>
                  <Button variant="destructive" onClick={signOut}>
                    Sign out
                  </Button>
                </div>
              )}
            </div>
          </TabbySection>

          <TabbySection title="Online Connectivity">
            <div className="px-4 py-4">
              {prefsLoading ? (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <CircularProgress indeterminate className="size-5" />
                  <span className="font-bold">Checking sync status...</span>
                </div>
              ) : connected ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="grid size-11 place-items-center rounded-full bg-tabby-mint text-primary">
                      <MaterialSymbol name="check_circle" className="text-[1.35rem]" />
                    </div>
                    <div>
                      <p className="text-title-medium font-black text-foreground">Connected with Web Tabby</p>
                      <p className="text-body-small text-muted-foreground">Data is synced from your Android app.</p>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[1.125rem] bg-background/70 px-4 py-3">
                      <p className="text-body-small font-bold text-muted-foreground">Last synced</p>
                      <p className="mt-1 text-title-medium font-black text-foreground">
                        {formatLastSync(preferences?.lastSyncedAt)}
                      </p>
                    </div>
                    <div className="rounded-[1.125rem] bg-background/70 px-4 py-3">
                      <p className="text-body-small font-bold text-muted-foreground">Synced data</p>
                      <p className="mt-1 text-title-medium font-black text-foreground">
                        {tasks.length} tasks, {classes.length} classes, {subjects.length} subjects
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="grid size-11 place-items-center rounded-full bg-secondary/25 text-foreground">
                      <MaterialSymbol name="phonelink_off" className="text-[1.35rem]" />
                    </div>
                    <div>
                      <p className="text-title-medium font-black text-foreground">Sync is not enabled</p>
                      <p className="text-body-small text-muted-foreground">Connect the Android app to use Web Tabby.</p>
                    </div>
                  </div>
                  <ol className="space-y-2 rounded-[1.125rem] bg-background/70 px-5 py-4 text-body-small font-medium text-muted-foreground">
                    <li>1. Open Tabby on your Android device.</li>
                    <li>2. Go to Settings - Online Connectivity.</li>
                    <li>3. Sign in with the same Google account.</li>
                    <li>4. Enable Connect with Web Tabby.</li>
                  </ol>
                </div>
              )}
            </div>
          </TabbySection>

          {preferences && (
            <TabbySection title="Profile">
              <InfoRow label="Profile name" value={preferences.profileName} />
              <InfoRow label="Real name" value={preferences.realName} />
              <InfoRow label="Student ID" value={preferences.studentId} />
              <InfoRow label="School" value={preferences.schoolName} />
              <InfoRow label="Class" value={preferences.classSection} />
              <InfoRow label="Study track" value={preferences.studyTrack} />
              <InfoRow label="Homeroom teacher" value={preferences.homeroomTeacher} />
            </TabbySection>
          )}

          {preferences && (
            <TabbySection title="App Preferences">
              <InfoRow label="Notifications" value={preferences.notificationsEnabled === undefined ? null : preferences.notificationsEnabled ? 'Enabled' : 'Disabled'} />
              <InfoRow label="Time format" value={preferences.use24HourFormat === undefined ? null : preferences.use24HourFormat ? '24-hour' : '12-hour'} />
              <InfoRow label="Week starts on" value={preferences.weekStartsOnMonday === undefined ? null : preferences.weekStartsOnMonday ? 'Monday' : 'Sunday'} />
              <InfoRow label="Default reminder" value={preferences.reminderDefaultMinutes === undefined ? null : `${preferences.reminderDefaultMinutes} minutes before`} />
            </TabbySection>
          )}
        </div>
      </div>
    </div>
  );
}
