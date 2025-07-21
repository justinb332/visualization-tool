import HiddenCanvas from '@/components/HiddenCanvas';

export default function HiddenSketchPage() {
  return (
    <main className="p-4 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">Hidden Sketch Exercise</h1>
      <p className="mb-6 text-center max-w-md">
        Draw from memory or imagination — but you won&apos;t see anything until you press &quot;Show Drawing.&quot; Use your mental image to guide your hand.
      </p>
      <HiddenCanvas />
    </main>
  );
}
