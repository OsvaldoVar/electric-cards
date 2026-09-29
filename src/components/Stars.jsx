import { Icon } from './Icon';

export function Stars({ count = 0 }) {
  return (
    <span className="stars" aria-label={`${count} de 3 estrellas`}>
      {[1, 2, 3].map((star) => (
        <Icon
          name="star"
          key={star}
          className={star <= count ? 'star-earned' : 'star-empty'}
          size={17}
        />
      ))}
    </span>
  );
}
