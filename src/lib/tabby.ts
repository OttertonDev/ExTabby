export const tabbyAssets = {
  icon: '/tabby-assets/tabby-ico.png',
  welcome: '/tabby-assets/tabby-headline-welcome.png',
};

export function androidColorToHex(color?: number | null): string {
  if (typeof color !== 'number') return '#246B5E';
  const hex = (color >>> 0).toString(16).padStart(8, '0');
  return `#${hex.substring(2)}`;
}

export function tintFromHex(hex: string, alpha = 0.16): string {
  const value = hex.replace('#', '');
  const red = Number.parseInt(value.substring(0, 2), 16);
  const green = Number.parseInt(value.substring(2, 4), 16);
  const blue = Number.parseInt(value.substring(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}
