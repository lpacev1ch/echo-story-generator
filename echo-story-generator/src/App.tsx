import { useState } from 'react';
import { BookOpen, Sparkles, Loader2 } from 'lucide-react';

const genres = [
  { id: 'fantasy', name: '🧙‍♂️ Fantasy', prompt: 'a magical fantasy world' },
  { id: 'scifi', name: '🚀 Sci-Fi', prompt: 'a futuristic science fiction setting' },
  { id: 'mystery', name: '🔍 Mystery', prompt: 'an intriguing mystery' },
  { id: 'romance', name: '💕 Romance', prompt: 'a romantic story' },
  { id: 'horror', name: '👻 Horror', prompt: 'a chilling horror tale' }
];

const tones = [
  { id: 'dramatic', name: 'Dramatic' },
  { id: 'humorous', name: 'Humorous' },
  { id: 'minimalist', name: 'Minimalist' },
  { id: 'poetic', name: 'Poetic' }
];

function StoryGenerator() {
  const [selectedGenre, setSelectedGenre] = useState('fantasy');
  const [selectedTone, setSelectedTone] = useState('dramatic');
  const [customPrompt, setCustomPrompt] = useState('');
  const [story, setStory] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(true);

  const generateStory = async () => {
    if (!apiKey) {
      alert('Please enter your OpenAI API key first!');
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
      setStory('Sorry, there was an error generating your story. Please check your API key and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {showApiKeyInput && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">
            🔑 OpenAI API Key Required
          </h3>
          <p className="text-sm text-yellow-700 mb-4">
            Enter your OpenAI API key to generate stories. Get one at{' '}
            <a 
              href="https://platform.openai.com/api-keys" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline"
            >
              platform.openai.com
            </a>
          </p>
          <div className="flex gap-2">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="flex-1 p-3 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
            <button
              onClick={() => setShowApiKeyInput(false)}
              disabled={!apiKey}
              className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Choose Genre
          </label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {genres.map(genre => (
              <button
                key={genre.id}
                onClick={() => setSelectedGenre(genre.id)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedGenre === genre.id
                    ? 'border-purple-600 bg-purple-50 text-purple-700'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                {genre.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Writing Tone
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {tones.map(tone => (
              <button
                key={tone.id}
                onClick={() => setSelectedTone(tone.id)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedTone === tone.id
                    ? 'border-purple-600 bg-purple-50 text-purple-700'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                {tone.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Custom Prompt (Optional)
          </label>
          <textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Add specific details for your story... (e.g., 'about a robot discovering emotions')"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
            rows={3}
          />
        </div>

        <button
          onClick={generateStory}
          disabled={isGenerating || !apiKey}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating Story...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Story
            </>
          )}
        </button>
      </div>

      {story && (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center gap-2 mb-4 text-purple-600">
            <BookOpen className="w-6 h-6" />
            <h2 className="text-xl font-bold">Your Story</h2>
          </div>
          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
            {story}
          </div>
          {!isGenerating && (
            <div className="mt-6 pt-6 border-t border-gray-200 text-sm text-gray-500">
              ✨ Story generated successfully
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">AI Story Generator</h1>
              <p className="text-xs text-gray-500">Powered by OpenAI</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <StoryGenerator />
      </main>

      <footer className="max-w-6xl mx-auto px-4 py-8 text-center text-sm text-gray-500">
        Built with React + OpenAI
      </footer>
    </div>
  );
}

export default App;
