interface BrandLogoProps {
  compact?: boolean;
}

const BrandLogo = ({ compact = false }: BrandLogoProps) => (
  <div className={compact ? 'brand-logo brand-logo--compact' : 'brand-logo'} aria-label="Клокет">
    <span className="kloket-mark" aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
    </span>
    {!compact && <span className="brand-logo__text">клокет</span>}
  </div>
);

export default BrandLogo;
