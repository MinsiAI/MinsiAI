import Image from "next/image";

const asset = (name: string) => `/figma-assets/${name}`;

export interface MinsiLogoProps {
  href?: string;
  size?: "sm" | "md" | "lg";
  priority?: boolean;
  className?: string;
}

const logoSizeClasses = {
  sm: {
    mark: "h-[18px] w-[31px] object-contain",
    text: "ml-[5px] h-[17.5px] w-[78px] object-contain"
  },
  md: {
    mark: "h-[18px] w-[31px] object-contain",
    text: "ml-[5px] h-[17.5px] w-[78px] object-contain"
  },
  lg: {
    mark: "h-[2.17cqw] w-[3.73cqw] object-contain",
    text: "ml-[0.53cqw] h-[2.1cqw] w-[9.33cqw] object-contain"
  }
};

export function MinsiLogo({ href = "/", size = "md", priority = false, className = "" }: MinsiLogoProps) {
  const classes = logoSizeClasses[size];

  return (
    <a className={`${className ? `${className} ` : ""}flex min-h-[44px] items-center`} href={href} aria-label="Minsi 首页">
      <Image className={`${classes.mark} minsi-logo-mark`} src={asset("logo-mark.png")} alt="" width={72} height={42} priority={priority} draggable={false} />
      <Image className={`${classes.text} minsi-logo-text`} src={asset("logo-text.png")} alt="minsi.ai" width={170} height={38} priority={priority} draggable={false} />
    </a>
  );
}
