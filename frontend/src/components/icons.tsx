// Small inline SVG icons shared across components. Kept dependency-free
// (no icon package) and sized via `currentColor` so they inherit text color.

interface IconProps {
    className?: string;
}

export function ChevronRightIcon({ className }: IconProps) {
    return (
        <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M6 3.5L10.5 8L6 12.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

export function ChevronDownIcon({ className }: IconProps) {
    return (
        <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3.5 6L8 10.5L12.5 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

export function CopyIcon({ className }: IconProps) {
    return (
        <svg className={className} width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <rect x="6" y="6" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10 6V3.5C10 2.94772 9.55228 2.5 9 2.5H3C2.44772 2.5 2 2.94772 2 3.5V9C2 9.55228 2.44772 10 3 10H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    );
}

export function CheckIcon({ className }: IconProps) {
    return (
        <svg className={className} width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 8.5L6.2 11.5L13 4.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}
