'use client';

import { useState, useEffect } from 'react';
import { FiSettings, FiX, FiCode, FiToggleLeft, FiToggleRight } from 'react-icons/fi';

export default function DevModeToggle() {
  const [showSettings, setShowSettings] = useState(false);
  const [devMode, setDevMode] = useState(false);

  useEffect(() => {
    // Check if dev mode is enabled
    const checkDevMode = async () => {
      try {
        const module = await import('@/lib/devMode');
        setDevMode(module.DEV_MODE.useMockData);
      } catch (err) {
        console.error('Failed to load dev mode config:', err);
      }
    };
    checkDevMode();
  }, []);

  const toggleDevMode = async () => {
    try {
      // temp
      // To actually toggle, user needs to edit /lib/devMode.ts manually
      setShowSettings(true);
    } catch (err) {
      console.error('Failed to toggle dev mode:', err);
    }
  };

  return (
    <>
      {/* Dev Mode Indicator */}
      {devMode && (
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-lime/90 hover:bg-accent-lime border border-accent-lime text-dark transition-all shadow-lg backdrop-blur-lg font-semibold"
          >
            <FiCode className="w-4 h-4" />
            <span className="text-sm">Dev Mode</span>
          </button>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-secondary border border-dark-secondary rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent-lime/20">
                  <FiCode className="w-5 h-5 text-accent-lime" />
                </div>
                <h2 className="text-xl font-bold text-white">Development Mode</h2>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 rounded-lg hover:bg-dark transition-colors"
              >
                <FiX className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-dark border border-accent-lime/20 rounded-xl p-4">
                <div className="flex items-start gap-3 mb-3">
                  {devMode ? (
                    <FiToggleRight className="w-6 h-6 text-green-400 flex-shrink-0" />
                  ) : (
                    <FiToggleLeft className="w-6 h-6 text-gray-400 flex-shrink-0" />
                  )}
                  <div>
                    <h3 className="font-semibold mb-1">
                      {devMode ? 'Dev Mode Enabled' : 'Dev Mode Disabled'}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {devMode
                        ? 'Using mock data - backend not required'
                        : 'Using live API - backend must be running'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-gray-400">Features in Dev Mode:</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">✓</span>
                    <span>Mock authentication (no backend needed)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">✓</span>
                    <span>Location sharing with 3 sample nearby users</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">✓</span>
                    <span>Group chat with sample conversations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">✓</span>
                    <span>Announcements with 4 sample posts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">✓</span>
                    <span>Issue reporting with 5 sample issues</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">✓</span>
                    <span>Teams with 5 sample teams (projects, study, sports)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">✓</span>
                    <span>Simulated network delays (500ms)</span>
                  </li>
                </ul>
              </div>

              <div className="bg-dark border border-accent-lime/20 rounded-xl p-4">
                <h3 className="font-semibold mb-2 text-sm text-white">To Toggle Dev Mode:</h3>
                <ol className="text-sm text-gray-400 space-y-1">
                  <li>1. Open <code className="px-1 py-0.5 rounded bg-dark text-accent-lime">/frontend/lib/devMode.ts</code></li>
                  <li>2. Change <code className="px-1 py-0.5 rounded bg-dark text-accent-lime">useMockData</code> to <code className="px-1 py-0.5 rounded bg-dark text-green-400">true</code> or <code className="px-1 py-0.5 rounded bg-dark text-red-400">false</code></li>
                  <li>3. Save the file (auto-reload will apply changes)</li>
                </ol>
              </div>

              <button
                onClick={() => setShowSettings(false)}
                className="w-full px-4 py-2 rounded-lg bg-accent-lime hover:bg-accent-lime/90 text-dark font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
