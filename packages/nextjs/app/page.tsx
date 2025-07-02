"use client";

import Image from "next/image";
import type { NextPage } from "next";

const Home: NextPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center pt-8 m-16">
      <div className="px-5 flex flex-col items-center w-full">
        <h1 className="text-center mb-8">
          <span className="block text-4xl font-bold">Ethereum.org Collectibles</span>
        </h1>
        <Image
          src="/ethereum.webp"
          alt="Ethereum Logo"
          width={600}
          height={600}
          className="rounded-2xl shadow-xl w-full max-w-2xl mt-2"
          priority
        />
      </div>
    </div>
  );
};

export default Home;
