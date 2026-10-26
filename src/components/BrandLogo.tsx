import React from 'react';

export const BRAND_LOGO_PATH = '/assets/aistudio/logo_8d92378f.png';

interface BrandLogoProps {
  /**
   * 'on-light': renders dark charcoal/graphite strokes on white/light backgrounds (mix-blend-multiply)
   * 'on-dark': renders inverted crisp white/silver strokes on dark backgrounds (invert + mix-blend-screen)
   */
  theme?: 'on-light' | 'on-dark';
  /**
   * Size preset adapted by cropping excess outer whitespace from the 16:9 graphic asset
   */
  size?: 'nav' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  alt?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  theme = 'on-light',
  size = 'md',
  className = '',
  alt = 'Gastón Barea · gastonbarea.com',
}) => {
  const sizeContainerClasses: Record<NonNullable<BrandLogoProps['size']>, string> = {
    nav: 'w-[148px] sm:w-[172px] h-11',
    sm: 'w-[136px] h-10',
    md: 'w-[190px] sm:w-[215px] h-14',
    lg: 'w-[225px] sm:w-[260px] h-16 sm:h-[72px]',
    xl: 'w-[260px] sm:w-[310px] h-20 sm:h-24',
  };

  const scaleClasses: Record<NonNullable<BrandLogoProps['size']>, string> = {
    nav: 'scale-[1.78]',
    sm: 'scale-[1.78]',
    md: 'scale-[1.72]',
    lg: 'scale-[1.68]',
    xl: 'scale-[1.62]',
  };

  const blendAndFilterClasses =
    theme === 'on-dark'
      ? 'invert contrast-150 brightness-110 mix-blend-screen'
      : 'mix-blend-multiply contrast-125 brightness-105';

  return (
    <div
      className={`relative overflow-hidden inline-flex items-center justify-center select-none shrink-0 ${sizeContainerClasses[size]} ${className}`}
    >
      <img
        src={BRAND_LOGO_PATH}
        alt={alt}
        className={`w-full h-full object-cover object-center pointer-events-none transition-all duration-200 ${scaleClasses[size]} ${blendAndFilterClasses}`}
      />
    </div>
  );
};
