'use client';

import { useEffect, useState } from 'react';

type FlashImageProps = {
  src: string;
  flashDuration?: number; // in ms
};

const FlashImage = ({ src, flashDuration = 100 }: FlashImageProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show image immediately after mount
    const timeout1 = setTimeout(() => {
      setVisible(true);
    }, 0);

    // Hide image after flashDuration
    const timeout2 = setTimeout(() => {
      setVisible(false);
    }, flashDuration);

    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
    };
  }, [flashDuration]);

  return (
    <div className="w-screen h-screen bg-white flex items-center justify-center">
      {visible && (
        <img
          src={src}
            alt="Flash"
            width={300}
            height={300}
            className="object-contain"
            />
      )}
    </div>
  );
};

export default FlashImage;
