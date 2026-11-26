import logoImg from '../assets/images/app-logo-raw.jpg';

export default function AppLogo({ size = 36, className = '', style = {} }) {
  return (
    <img
      src={logoImg}
      alt="Bondr Logo"
      width={size}
      height={size}
      className={`app-brand-logo-img ${className}`}
      style={{
        width: size,
        height: size,
        objectFit: 'contain',
        mixBlendMode: 'multiply',
        display: 'block',
        ...style,
      }}
    />
  );
}

