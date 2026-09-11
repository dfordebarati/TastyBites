import { optimize } from '../../lib/image';

export default function Thumb({ item }) {
  if (!item.image) return <div className="h-11 w-11 shrink-0 rounded bg-line" />;

  return (
    <img
      src={optimize(item.image, 'c_fill,w_120,h_120')}
      alt=""
      className="h-11 w-11 shrink-0 rounded object-cover"
    />
  );
}
