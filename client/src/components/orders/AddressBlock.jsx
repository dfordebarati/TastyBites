import { googleMapsUrl } from '../../lib/maps';

export default function AddressBlock({ order, className = '' }) {
  const { address } = order;
  const hasPin = address.location?.lat != null && address.location?.lng != null;

  return (
    <div className={`text-sm leading-relaxed text-ink-soft ${className}`}>
      <p className="font-medium text-ink">{order.customerName}</p>
      <p>
        {address.line1}, {address.line2}
      </p>
      {address.landmark && <p>{address.landmark}</p>}
      <p>
        {address.city}, {address.state} {address.pincode}
      </p>
      <a href={`tel:+91${order.phone}`} className="mt-1 inline-block text-ink hover:text-brand">
        +91 {order.phone}
      </a>
      {order.instructions && <p className="mt-2 italic">&ldquo;{order.instructions}&rdquo;</p>}
      {hasPin && (
        <a
          href={googleMapsUrl(address.location)}
          target="_blank"
          rel="noreferrer"
          className="mt-3 block font-medium text-brand hover:underline"
        >
          Open the pinned location in Google Maps &#8599;
        </a>
      )}
    </div>
  );
}
