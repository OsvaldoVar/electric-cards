const paths = {
  settings:
    'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm-2-5h4l1 3 3 1 3 2-2 3 2 3-3 2-3 1-1 3h-4l-1-3-3-1-3-2 2-3-2-3 3-2 3-1 1-3Z',
  bolt: 'm13 2-8 11h6l-1 9 9-12h-6l0-8Z',
  arrow: 'M4 12h16m-6-6 6 6-6 6',
  back: 'M20 12H4m6-6-6 6 6 6',
  book: 'M12 5v16m0-16C9 3 5 3 2 4v15c3-1 7-1 10 2 3-3 7-3 10-2V4c-3-1-7-1-10 1Z',
  grid: 'M3 3h7v7H3V3Zm11 0h7v7h-7V3ZM3 14h7v7H3v-7Zm11 0h7v7h-7v-7Z',
  check: 'm5 12 4 4L19 6',
  close: 'm6 6 12 12M6 18 18 6',
  reset: 'M3 10a9 9 0 1 1 2 8M3 4v6h6',
  play: 'm8 4 12 8-12 8V4Z',
  help: 'M9 8a3 3 0 1 1 4 3c-1 1-1 2-1 3m0 3v1M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z',
  lock: 'M6 10h12v11H6V10Zm3 0V6a3 3 0 0 1 6 0v4',
  fit: 'M8 3H3v5m13-5h5v5M3 16v5h5m8 0h5v-5',
  plus: 'M12 4v16M4 12h16',
  minus: 'M4 12h16',
  link: 'm10 13 4-4m-6 5-2 2a4 4 0 1 1-5-5l4-4m10 3 2-2a4 4 0 1 0-5-5l-4 4',
  shield: 'm12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6l9-4Zm-4 9 3 3 5-6',
  led: 'M8 15h8V9a4 4 0 0 0-8 0v6Zm1 0v6m6-6v6M5 9H2m20 0h-3M6 3 4 1m14 2 2-2',
  door: 'M5 21V3h14v18M9 21V6h7v15m-3-8h1M3 21h18',
  flag: 'M5 22V3m0 0h14l-3 4 3 4H5',
  alarm: 'M6 17h12l-2-3V9a4 4 0 0 0-8 0v5l-2 3Zm4 3h4M12 2v2',
  motor: 'M7 5h10v14H7V5Zm-4 3h4m10 4h5M10 8h4m-4 4h4m-4 4h4',
};

export function Icon({ name, className = '', size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
      strokeLinejoin="miter"
      className={className}
      aria-hidden="true"
    >
      <path d={paths[name] ?? paths.bolt} />
    </svg>
  );
}
