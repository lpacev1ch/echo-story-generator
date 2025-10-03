import { useState } from 'react';
import { BookOpen, Sparkles, Loader2, Settings, X, Key } from 'lucide-react';

const genres = [
  { id: 'fantasy', name: '🧙‍♂️ Fantasy', prompt: 'a magical fantasy world', color: 'from-purple-500 to-pink-500' },
  { id: 'scifi', name: '🚀 Sci-Fi', prompt: 'a futuristic science fiction setting', color: 'from-blue-500 to-cyan-500' },
  { id: 'mystery', name: '🔍 Mystery', prompt: 'an intriguing mystery', color: 'from-amber-500 to-orange-500' },
  { id: 'romance', name: '💕 Romance', prompt: 'a romantic story', color: 'from-rose-500 to-pink-500' },
  { id: 'horror', name: '👻 Horror', prompt: 'a chilling horror tale', color: 'from-red-500 to-purple-500' }
];

const tones = [
  { id: 'dramatic', name: 'Dramatic', icon: '🎭' },
  { id: 'humorous', name: 'Humorous', icon: '😄' },
  { id: 'minimalist', name: 'Minimalist', icon: '✨' },
  { id: 'poetic', name: 'Poetic', icon: '🌸' }
];

function StoryGenerator() {
  const [selectedGenre, setSelectedGenre] = useState('fantasy');
  const [selectedTone, setSelectedTone] = useState('dramatic');
  const [customPrompt, setCustomPrompt] = useState('');
  const [story, setStory] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');

  const generateStory = async () => {
    if (!apiKey) {
      setShowSettings(true);
      return;
    }

    setIsGenerating(true);
    setStory('');

    try {
      const genre = genres.find(g => g.id === selectedGenre);
      const tone = tones.find(t => t.id === selectedTone);
      const prompt = customPrompt || 
        `Write a creative short story (about 200-300 words) in ${genre?.prompt} with a ${tone?.name.toLowerCase()} tone. Make it engaging and vivid.`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'user', content: prompt }
          ],
          stream: true
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate story');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const json = JSON.parse(line.slice(6));
              const content = json.choices[0]?.delta?.content;
              if (content) {
                setStory(prev => prev + content);
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error('Error generating story:', error);
      setStory('⚠️ Error: Please check your API key and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const saveApiKey = () => {
    setApiKey(tempApiKey);
    setShowSettings(false);
  };

  const selectedGenreData = genres.find(g => g.id === selectedGenre);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowSettings(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Key className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">API Settings</h3>
                <p className="text-sm text-gray-500">Configure your OpenAI key</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  OpenAI API Key
                </label>
                <input
                  type="password"
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Get your API key from{' '}
                  <a 
                    href="https://platform.openai.com/api-keys" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:underline"
                  >
                    platform.openai.com
                  </a>
                </p>
              </div>

              <button
                onClick={saveApiKey}
                disabled={!tempApiKey}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Save API Key
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${selectedGenreData?.color} rounded-3xl shadow-lg mb-4`}>
          <BookOpen className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-5xl font-bold text-gray-900">
          AI Story Generator
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Create unique stories powered by AI. Choose your genre, set the tone, and watch the magic happen.
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* Genre Selection */}
        <div className="p-8 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Choose Your Genre</h2>
            <button
              onClick={() => {
                setTempApiKey(apiKey);
                setShowSettings(true);
              }}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {genres.map(genre => (
              <button
                key={genre.id}
                onClick={() => setSelectedGenre(genre.id)}
                className={`group relative p-6 rounded-2xl border-2 transition-all ${
                  selectedGenre === genre.id
                    ? 'border-transparent shadow-lg scale-105'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                {selectedGenre === genre.id && (
                  <div className={`absolute inset-0 bg-gradient-to-br ${genre.color} opacity-10 rounded-2xl`}></div>
                )}
                <div className="relative">
                  <div className="text-4xl mb-2">{genre.name.split(' ')[0]}</div>
                  <div className="text-sm font-semibold text-gray-900">{genre.name.split(' ')[1]}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Tone Selection */}
        <div className="p-8 border-b border-gray-100 bg-gray-50">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Set the Tone</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {tones.map(tone => (
              <button
                key={tone.id}
                onClick={() => setSelectedTone(tone.id)}
                className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                  selectedTone === tone.id
                    ? 'border-purple-500 bg-purple-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-sm'
                }`}
              >
                <span className="text-2xl">{tone.icon}</span>
                <span className={`font-semibold ${selectedTone === tone.id ? 'text-purple-700' : 'text-gray-700'}`}>
                  {tone.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Prompt */}
        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Add Your Touch</h2>
          <textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Optional: Add specific details like characters, settings, or plot points... (e.g., 'about a time-traveling librarian who discovers ancient secrets')"
            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all"
            rows={4}
          />
        </div>

        {/* Generate Button */}
        <div className="p-8 pt-0">
          <button
            onClick={generateStory}
            disabled={isGenerating}
            className={`w-full py-5 bg-gradient-to-r ${selectedGenreData?.color} text-white rounded-2xl font-bold text-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transform hover:scale-105`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Crafting Your Story...
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6" />
                Generate Story
              </>
            )}
          </button>
        </div>
      </div>

      {/* Story Output */}
      {story && (
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden animate-fadeIn">
          <div className={`h-2 bg-gradient-to-r ${selectedGenreData?.color}`}></div>
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-12 h-12 bg-gradient-to-br ${selectedGenreData?.color} rounded-xl flex items-center justify-center`}>
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Your Story</h2>
                <p className="text-sm text-gray-500">{selectedGenreData?.name} • {tones.find(t => t.id === selectedTone)?.name}</p>
              </div>
            </div>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-lg">
                {story}
              </p>
            </div>

            {!isGenerating && (
              <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-between">
                <span className="text-sm text-gray-500 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Generated successfully
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(story);
                    alert('Story copied to clipboard!');
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all text-sm font-medium"
                >
                  Copy Story
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="relative">
        <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">StoryForge AI</h1>
                <p className="text-xs text-gray-500">Powered by OpenAI</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="hidden md:block text-right mr-4">
                <p className="text-xs text-gray-500">Built with React</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-12">
          <StoryGenerator />
        </main>

        <footer className="max-w-7xl mx-auto px-4 py-12 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-gray-500">
            <Sparkles className="w-4 h-4" />
            <span>Made with love and AI</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
