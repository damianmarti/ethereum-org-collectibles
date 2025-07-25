import React from "react";

const EthDiamondIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({
  className = "h-[35px] w-[22px] opacity-85 hover:opacity-100",
  ...props
}) => (
  <svg
    fill="currentColor"
    viewBox="0 0 115 182"
    height="1em"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path
      d="M57.5054 181V135.84L1.64064 103.171L57.5054 181Z"
      fill="#F0CDC2"
      stroke="#1616B4"
      strokeLinejoin="round"
    ></path>
    <path
      d="M57.6906 181V135.84L113.555 103.171L57.6906 181Z"
      fill="#C9B3F5"
      stroke="#1616B4"
      strokeLinejoin="round"
    ></path>
    <path
      d="M57.5055 124.615V66.9786L1 92.2811L57.5055 124.615Z"
      fill="#88AAF1"
      stroke="#1616B4"
      strokeLinejoin="round"
    ></path>
    <path
      d="M57.6903 124.615V66.9786L114.196 92.2811L57.6903 124.615Z"
      fill="#C9B3F5"
      stroke="#1616B4"
      strokeLinejoin="round"
    ></path>
    <path
      d="M1.00006 92.2811L57.5054 1V66.9786L1.00006 92.2811Z"
      fill="#F0CDC2"
      stroke="#1616B4"
      strokeLinejoin="round"
    ></path>
    <path
      d="M114.196 92.2811L57.6906 1V66.9786L114.196 92.2811Z"
      fill="#B8FAF6"
      stroke="#1616B4"
      strokeLinejoin="round"
    ></path>
  </svg>
);

export default EthDiamondIcon;
