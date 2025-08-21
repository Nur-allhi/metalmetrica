
import type { SVGProps } from "react";
import { cn } from "@/lib/utils";

export default function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      {...props}
      className={cn("text-foreground", props.className)}
    >
      <path
        fill="currentColor"
        d="M208,88H171.22a8,8,0,0,1-5.66-2.34L144,64,128.89,48.89a8,8,0,0,1-5.66-2.34L112,35.22,95.22,46.56A8,8,0,0,1,89.56,48H48a8,8,0,0,0-8,8V88H16a8,8,0,0,0-8,8V208a8,8,0,0,0,8,8H240a8,8,0,0,0,8-8V96A8,8,0,0,0,240,88ZM224,192H32V176H224Zm0-32H32V144H224Zm0-32H32V112H224Z"
        className="fill-secondary"
      />
      <path
        fill="hsl(var(--primary))"
        d="M176,56h-8V48a8,8,0,0,0-16,0v8h-8a8,8,0,0,0-8,8v8H120a8,8,0,0,0,0,16h16v8a8,8,0,0,0,16,0V88h8a8,8,0,0,0,0-16H160V64a8,8,0,0,0-8-8h-8V48a8,8,0,0,0-16,0v8h-8v8h48Z"
        transform="translate(144, 18) rotate(45)"
        className="fill-primary"
      />
       <path
        fill="currentColor"
        d="M168,32H88a8,8,0,0,0-5.66,2.34L64,52.69,45.66,34.34A8,8,0,0,0,40,32H16a8,8,0,0,0-8,8V64a8,8,0,0,0,8,8H168a8,8,0,0,0,5.66-2.34L192,51.31l18.34,18.35A8,8,0,0,0,216,72h24a8,8,0,0,0,8-8V40a8,8,0,0,0-8-8H176A8,8,0,0,0,168,32ZM224,56H218.34l-16-16,16-16H224ZM32,56V48H37.66l16,16-16,16H32Z"
        className="fill-primary"
      />
    </svg>
  );
}
