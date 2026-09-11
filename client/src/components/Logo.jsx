const SIZES = {
  sm: 'h-12',
  md: 'h-14',
  lg: 'h-20 sm:h-24',
};

export default function Logo({ size = 'md', className = '' }) {
  return <img src="/logo.png" alt="TastyBites" className={`w-auto ${SIZES[size]} ${className}`} />;
}
