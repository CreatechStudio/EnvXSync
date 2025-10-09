export function getRelativeTime(date: Date, locale: string) {
    const now = new Date();
    const diff = Math.round(now.getTime() - date.getTime());
    if (isNaN(diff)) {
        return date.toLocaleTimeString(locale);
    }
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);
    if (Math.abs(years) > 0) return rtf.format(-years, 'year');
    if (Math.abs(months) > 0) return rtf.format(-months, 'month');
    if (Math.abs(weeks) > 0) return rtf.format(-weeks, 'week');
    if (Math.abs(days) > 0) return rtf.format(-days, 'day');
    if (Math.abs(hours) > 0) return rtf.format(-hours, 'hour');
    if (Math.abs(minutes) > 0) return rtf.format(-minutes, 'minute');
    return rtf.format(-seconds, 'second');
}
