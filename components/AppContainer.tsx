"use client";

interface AppContainerProps {
  appUrl: string;
  appName: string;
}

export default function AppContainer({ appUrl, appName }: AppContainerProps) {
  return (
    <div className="flex-1 overflow-hidden p-6">
      {/* Iframe fullscreen */}
      <div className="h-full rounded-xl shadow-2xl border border-gray-700/50 bg-black overflow-hidden">
        <iframe
          src={appUrl}
          className="w-full h-full"
          title={appName}
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-presentation allow-storage"
        />
      </div>
    </div>
  );
}
